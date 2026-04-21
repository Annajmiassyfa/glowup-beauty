import prisma from '../prisma.js';

// Helper: normalize order status from DB to display labels
const normalizeStatus = (order) => {
  const statusMap = {
    Created: 'Menunggu Verifikasi',
    Processed: 'Diproses',
    Shipped: 'Dikirim',
    Completed: 'Selesai',
    Cancelled: 'Dibatalkan',
  };
  return { ...order, statusLabel: statusMap[order.orderStatus] || order.orderStatus };
};

// Helper: Apply auto-cancel if order is 'Created' and older than 15 minutes
const applyPassiveAutoCancel = async (order) => {
  if (order.orderStatus === 'Created') {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    if (new Date(order.createdAt) < fifteenMinutesAgo) {
      console.log(`[AutoCancel] Order #${order.id} is overdue. Cancelling...`);
      // Update status in DB
      const updatedOrder = await prisma.order.update({
        where: { id: order.id },
        data: { 
          orderStatus: 'Cancelled',
          paymentStatus: 'Failed'
        },
        include: {
          items: {
            include: {
              product: {
                include: { images: { where: { isPrimary: true }, take: 1 } }
              }
            }
          }
        }
      });
      return updatedOrder;
    }
  }
  return order;
};

// GET /api/orders — fetch all orders for logged-in user
export const getOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.userId },
      include: {
        items: {
          include: {
            product: {
              include: { images: { where: { isPrimary: true }, take: 1 } }
            },
            review: {
              select: { id: true, rating: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const processedOrders = await Promise.all(orders.map(order => applyPassiveAutoCancel(order)));
    const normalized = processedOrders.map(normalizeStatus);
    res.status(200).json(normalized);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Gagal mengambil riwayat pesanan' });
  }
};

// GET /api/orders/:id — fetch a single order with full detail
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findFirst({
      where: { id: parseInt(id), userId: req.userId }, // ownership check
      include: {
        items: {
          include: {
            product: {
              include: { images: { where: { isPrimary: true }, take: 1 } }
            }
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ message: 'Pesanan tidak ditemukan' });
    }

    // Apply auto-cancel check
    const processedOrder = await applyPassiveAutoCancel(order);

    res.status(200).json(normalizeStatus(processedOrder));
  } catch (error) {
    console.error('Get order by id error:', error);
    res.status(500).json({ message: 'Gagal mengambil detail pesanan' });
  }
};

// POST /api/orders — create a new order from current cart data
export const createOrder = async (req, res) => {
  try {
    const {
      items,           // [{ productId, qty, price, discount }]
      subtotal,
      shippingCost,
      discountAmount,
      grandTotal,
      paymentMethod,
      shippingSnapshot // JSON string or object: address info at time of order
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Keranjang kosong' });
    }

    if (!grandTotal) {
      return res.status(400).json({ message: 'Total belanja tidak valid' });
    }


    const order = await prisma.order.create({
      data: {
        userId: req.userId,
        subtotal: subtotal || 0,
        shippingCost: shippingCost || 0,
        discountAmount: discountAmount || 0,
        grandTotal,
        paymentMethod: paymentMethod || 'Virtual Account',
        paymentStatus: 'Pending',
        orderStatus: 'Created',
        trackingNumber: null,
        shippingSnapshot: typeof shippingSnapshot === 'object'
          ? JSON.stringify(shippingSnapshot)
          : (shippingSnapshot || null),
        items: {
          create: items.map(item => ({
            productId: item.productId,
            qty: item.qty,
            price: item.price,
            discount: item.discount || 0,
            total: item.price * item.qty,
          }))
        }
      },
      include: {
        items: {
          include: {
            product: {
              include: { images: { where: { isPrimary: true }, take: 1 } }
            }
          }
        }
      }
    });

    res.status(201).json({ message: 'Pesanan berhasil dibuat', order: normalizeStatus(order) });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Gagal membuat pesanan' });
  }
};

// PATCH /api/orders/:id/complete — mark shipped order as completed + award reward points
export const completeOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const orderId = parseInt(id);

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: req.userId },
      select: { id: true, orderStatus: true, grandTotal: true }
    });

    if (!order) {
      return res.status(404).json({ message: 'Pesanan tidak ditemukan' });
    }

    if (order.orderStatus !== 'Shipped') {
      return res.status(400).json({ message: 'Hanya pesanan dengan status Dikirim yang bisa diselesaikan' });
    }

    // ── Points calculation ───────────────────────────────────────────────────
    // Rule: 1 point per Rp10.000 spent (integer, floored)
    const pointsEarned = Math.floor(order.grandTotal / 10000);

    // ── Atomic transaction: complete order + award points + update tier ──────
    const [updatedOrder, updatedUser] = await prisma.$transaction(async (tx) => {
      // 1. Mark order as completed
      const completedOrder = await tx.order.update({
        where: { id: orderId },
        data: { orderStatus: 'Completed', shippingStatus: 'Delivered' },
      });

      // 2. Get current user points to compute new total
      const currentUser = await tx.user.findUnique({
        where: { id: req.userId },
        select: { rewardPoints: true }
      });
      const newPoints = (currentUser?.rewardPoints || 0) + pointsEarned;

      // 3. Resolve new tier based on cumulative points
      //    Starter  : 0 – 999 pts   (or just joined)
      //    Insider  : 1.000 – 4.999 pts
      //    VIP      : 5.000+ pts
      let newTier = 'Starter';
      if (newPoints >= 5000) newTier = 'VIP';
      else if (newPoints >= 1000) newTier = 'Insider';

      // 4. Update user — ensure isMember is set (in case user ordered before activating membership)
      const user = await tx.user.update({
        where: { id: req.userId },
        data: {
          rewardPoints: newPoints,
          memberTier: newTier,
          isMember: true,
          memberSince: currentUser?.rewardPoints === 0 ? new Date() : undefined, // set only on first points
        },
        select: {
          id: true, name: true, email: true, phone: true, avatar: true, role: true,
          isMember: true, memberTier: true, memberSince: true, rewardPoints: true,
        }
      });

      return [completedOrder, user];
    });

    res.status(200).json({
      message: `Pesanan berhasil diselesaikan! Kamu mendapatkan +${pointsEarned} poin.`,
      pointsEarned,
      order: normalizeStatus(updatedOrder),
      user: updatedUser,
    });
  } catch (error) {
    console.error('Complete order error:', error);
    res.status(500).json({ message: 'Gagal menyelesaikan pesanan' });
  }
};
