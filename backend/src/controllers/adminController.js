import prisma from '../prisma.js';

// Helper: Apply auto-cancel if order is 'Created' and older than 15 minutes
const applyPassiveAutoCancel = async (order) => {
  if (order.orderStatus === 'Created') {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    if (new Date(order.createdAt) < fifteenMinutesAgo) {
      console.log(`[Admin-AutoCancel] Order #${order.id} is overdue. Cancelling...`);
      return await prisma.order.update({
        where: { id: order.id },
        data: { 
          orderStatus: 'Cancelled',
          paymentStatus: 'Failed'
        },
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } },
          items: {
            include: {
              product: {
                include: { images: { where: { isPrimary: true }, take: 1 } }
              }
            }
          }
        }
      });
    }
  }
  return order;
};

// GET /api/admin/stats
export const getDashboardStats = async (req, res) => {
  try {
    // 0. Preliminary cleanup of expired orders
    const expiredOrders = await prisma.order.findMany({
      where: { 
        orderStatus: 'Created',
        createdAt: { lt: new Date(Date.now() - 15 * 60 * 1000) }
      }
    });
    if (expiredOrders.length > 0) {
      await Promise.all(expiredOrders.map(order => applyPassiveAutoCancel(order)));
    }

    // 1. Total Sales (Paid orders)
    const salesAgg = await prisma.order.aggregate({
      _sum: { grandTotal: true },
      where: { orderStatus: { not: 'Cancelled' } } // or maybe just 'Completed' but usually all non-cancelled paid orders count for sales
    });
    const totalSales = salesAgg._sum.grandTotal || 0;

    // 2. Active Orders (Created, Processed, Shipped)
    const activeOrders = await prisma.order.count({
      where: { orderStatus: { in: ['Created', 'Processed', 'Shipped'] } }
    });

    // 3. Total Products
    const totalProducts = await prisma.product.count({
      where: { isActive: true }
    });

    // 4. Total Customers
    const totalCustomers = await prisma.user.count({
      where: { role: 'Customer' }
    });

    res.status(200).json({
      totalSales,
      activeOrders,
      totalProducts,
      totalCustomers
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ message: 'Gagal memuat statistik dashboard' });
  }
};

// GET /api/admin/orders
export const getAllOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true }
        },
        items: {
          include: {
            product: {
              include: { images: { where: { isPrimary: true }, take: 1 } }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const processedOrders = await Promise.all(orders.map(order => applyPassiveAutoCancel(order)));

    res.status(200).json(processedOrders);
  } catch (error) {
    console.error('Admin get orders error:', error);
    res.status(500).json({ message: 'Gagal memuat daftar pesanan' });
  }
};

// PATCH /api/admin/orders/:id
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus, paymentStatus, trackingNumber } = req.body;
    const orderId = parseInt(id);

    // 1. Fetch current order state
    const currentOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true } } }
    });

    if (!currentOrder) {
      return res.status(404).json({ message: 'Pesanan tidak ditemukan' });
    }

    const oldStatus = currentOrder.orderStatus;
    const newStatus = orderStatus;

    console.log(`[AdminUpdate] Order #${orderId}: ${oldStatus} -> ${newStatus}`);

    // 2. Wrap everything in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const processedStatuses = ['Processed', 'Shipped', 'Completed'];
      const isNowProcessed = processedStatuses.includes(newStatus);
      const wasAlreadyProcessed = processedStatuses.includes(oldStatus);

      // ─── STOCK DEDUCTION ───
      // Trigger: Transitioning TO a processed state FROM a non-processed state
      if (isNowProcessed && !wasAlreadyProcessed) {
        console.log(`[StockDeduction] Triggered for Order #${orderId}`);
        for (const item of currentOrder.items) {
          console.log(`[StockDeduction] Item: ProductID ${item.productId}, Qty ${item.qty}`);
          const product = await tx.product.findUnique({ where: { id: item.productId } });
          
          if (!product || product.stock < item.qty) {
            console.log(`[StockDeduction] FAILED: Insufficient stock for ${product?.name}`);
            throw new Error(`Stok produk '${product?.name || 'Unknown'}' tidak mencukupi (Sisa: ${product?.stock || 0})`);
          }

          const updatedProd = await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.qty } }
          });
          console.log(`[StockDeduction] SUCCESS: ${product.name} stock ${product.stock} -> ${updatedProd.stock}`);
        }
      }

      // ─── STOCK RESTORATION ───
      // Trigger: Transitioning TO 'Cancelled' FROM a processed state
      if (newStatus === 'Cancelled' && wasAlreadyProcessed) {
        console.log(`[StockRestore] Triggered for Order #${orderId}`);
        for (const item of currentOrder.items) {
          const updatedProd = await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.qty } }
          });
          console.log(`[StockRestore] SUCCESS: ProductID ${item.productId} stock incremented by ${item.qty}`);
        }
      }

      // 3. Update the order
      const updateData = {};
      if (orderStatus) updateData.orderStatus = orderStatus;
      if (paymentStatus) updateData.paymentStatus = paymentStatus;
      if (trackingNumber) updateData.trackingNumber = trackingNumber;

      return await tx.order.update({
        where: { id: orderId },
        data: updateData,
        include: {
          user: { select: { id: true, name: true, email: true } },
          items: true
        }
      });
    });

    res.status(200).json({
      message: `Pesanan #${id} berhasil diperbarui`,
      order: result
    });
  } catch (error) {
    console.error('[AdminUpdate] Error:', error);
    // Determine if it's a validation error or server error
    const isValidationError = error.message.includes('Stok produk');
    res.status(isValidationError ? 400 : 500).json({ 
      message: isValidationError ? error.message : 'Gagal memperbarui status pesanan' 
    });
  }
};
