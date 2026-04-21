import prisma from '../prisma.js';

// Valid reasons
const VALID_REASONS = ['rusak', 'salah', 'kurang', 'kedaluwarsa'];

// Only "Completed" orders are eligible for return
const ELIGIBLE_STATUSES = ['Completed'];

/**
 * POST /api/returns
 * Create a new return request for a completed order.
 */
export const createReturn = async (req, res) => {
  try {
    const { orderId, orderItemId, productName, reason, detail } = req.body;

    // ── Input validation ──────────────────────────────────────────────────────
    if (!orderId || !productName || !reason || !detail) {
      return res.status(400).json({
        message: 'Field orderId, productName, reason, dan detail wajib diisi.'
      });
    }

    if (!VALID_REASONS.includes(reason)) {
      return res.status(400).json({ message: 'Alasan retur tidak valid.' });
    }

    if (!detail.trim() || detail.trim().length < 10) {
      return res.status(400).json({
        message: 'Detail kendala harus diisi minimal 10 karakter.'
      });
    }

    // ── Ownership + eligibility check ─────────────────────────────────────────
    const order = await prisma.order.findFirst({
      where: { id: parseInt(orderId), userId: req.userId },
      select: { id: true, orderStatus: true }
    });

    if (!order) {
      return res.status(404).json({ message: 'Pesanan tidak ditemukan.' });
    }

    if (!ELIGIBLE_STATUSES.includes(order.orderStatus)) {
      return res.status(400).json({
        message: 'Pengajuan retur hanya dapat dilakukan untuk pesanan dengan status Selesai.'
      });
    }

    // ── Prevent duplicate return on same item ────────────────────────────────
    const existingReturn = await prisma.returnRequest.findFirst({
      where: {
        orderId: parseInt(orderId),
        userId: req.userId,
        productName,
        status: { notIn: ['Rejected'] }, // allow re-application if rejected
      }
    });

    if (existingReturn) {
      return res.status(400).json({
        message: `Pengajuan retur untuk produk "${productName}" pada pesanan ini sudah pernah diajukan.`
      });
    }

    // ── Validate orderItemId if provided ──────────────────────────────────────
    if (orderItemId) {
      const item = await prisma.orderItem.findFirst({
        where: { id: parseInt(orderItemId), orderId: parseInt(orderId) }
      });
      if (!item) {
        return res.status(400).json({ message: 'Item pesanan tidak valid.' });
      }
    }

    // ── Create the return request ─────────────────────────────────────────────
    const returnRequest = await prisma.returnRequest.create({
      data: {
        userId: req.userId,
        orderId: parseInt(orderId),
        orderItemId: orderItemId ? parseInt(orderItemId) : null,
        productName: productName.trim(),
        reason,
        detail: detail.trim(),
        status: 'Pending',
      }
    });

    res.status(201).json({
      message: 'Pengajuan retur berhasil dikirim. Tim kami akan menghubungi Anda dalam 1x24 jam.',
      returnRequest,
    });
  } catch (error) {
    console.error('Create return error:', error);
    res.status(500).json({ message: 'Gagal mengirim pengajuan retur.' });
  }
};

/**
 * GET /api/returns
 * Get all return requests for the logged-in user.
 */
export const getMyReturns = async (req, res) => {
  try {
    const returns = await prisma.returnRequest.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        order: {
          select: {
            id: true,
            grandTotal: true,
            trackingNumber: true,
            orderStatus: true,
            createdAt: true,
          }
        }
      }
    });

    res.status(200).json(returns);
  } catch (error) {
    console.error('Get returns error:', error);
    res.status(500).json({ message: 'Gagal mengambil daftar retur.' });
  }
};

/**
 * GET /api/returns/order/:orderId
 * Get return requests for a specific order (must be owned by logged-in user).
 */
export const getReturnsByOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Ownership check
    const order = await prisma.order.findFirst({
      where: { id: parseInt(orderId), userId: req.userId },
      select: { id: true }
    });

    if (!order) {
      return res.status(404).json({ message: 'Pesanan tidak ditemukan.' });
    }

    const returns = await prisma.returnRequest.findMany({
      where: { orderId: parseInt(orderId), userId: req.userId },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(returns);
  } catch (error) {
    console.error('Get returns by order error:', error);
    res.status(500).json({ message: 'Gagal mengambil data retur.' });
  }
};

// ─── ADMIN ENDPOINTS ──────────────────────────────────────────────────────────

const VALID_STATUSES = ['Pending', 'Approved', 'Rejected', 'Completed'];

/**
 * GET /api/admin/returns
 * Admin: list all return requests across all users.
 * Optional query: ?status=Pending
 */
export const getAllReturnsAdmin = async (req, res) => {
  try {
    const { status } = req.query;
    const where = status && VALID_STATUSES.includes(status) ? { status } : {};

    const returns = await prisma.returnRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
        order: {
          select: {
            id: true,
            grandTotal: true,
            trackingNumber: true,
            orderStatus: true,
            createdAt: true,
          }
        }
      }
    });

    res.status(200).json(returns);
  } catch (error) {
    console.error('Admin get returns error:', error);
    res.status(500).json({ message: 'Gagal mengambil daftar retur.' });
  }
};

/**
 * PATCH /api/admin/returns/:id/status
 * Admin: update the status of a return request.
 * Body: { status: 'Approved' | 'Rejected' | 'Completed' }
 */
export const updateReturnStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        message: `Status tidak valid. Harus salah satu dari: ${VALID_STATUSES.join(', ')}`
      });
    }

    const existing = await prisma.returnRequest.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existing) {
      return res.status(404).json({ message: 'Pengajuan retur tidak ditemukan.' });
    }

    const updated = await prisma.returnRequest.update({
      where: { id: parseInt(id) },
      data: { status },
      include: {
        user: { select: { id: true, name: true, email: true } },
        order: { select: { id: true, grandTotal: true, orderStatus: true } }
      }
    });

    res.status(200).json({
      message: `Status retur berhasil diubah ke "${status}".`,
      returnRequest: updated,
    });
  } catch (error) {
    console.error('Update return status error:', error);
    res.status(500).json({ message: 'Gagal mengubah status retur.' });
  }
};
