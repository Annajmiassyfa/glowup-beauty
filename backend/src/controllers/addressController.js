import prisma from '../prisma.js';

export const getAddresses = async (req, res) => {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId: req.userId },
      orderBy: [{ isPrimary: 'desc' }, { id: 'asc' }]
    });
    res.status(200).json(addresses);
  } catch (error) {
    console.error('Get addresses error:', error);
    res.status(500).json({ message: 'Gagal mengambil data alamat' });
  }
};

export const createAddress = async (req, res) => {
  try {
    const { label, recipientName, phone, province, city, district, postalCode, detailAddress, notes } = req.body;

    if (!label || !recipientName || !phone || !detailAddress) {
      return res.status(400).json({ message: 'Label, Nama Penerima, Telepon, dan Detail Alamat wajib diisi' });
    }

    // Count existing addresses to determine if this is the first one
    const existingCount = await prisma.address.count({ where: { userId: req.userId } });
    const willBePrimary = existingCount === 0;

    const address = await prisma.address.create({
      data: {
        userId: req.userId,
        label,
        recipientName,
        phone,
        province: province || '',
        city: city || '',
        district: district || '',
        postalCode: postalCode || '',
        detailAddress,
        notes: notes || null,
        isPrimary: willBePrimary,
      }
    });

    res.status(201).json({ message: 'Alamat berhasil ditambahkan', address });
  } catch (error) {
    console.error('Create address error:', error);
    res.status(500).json({ message: 'Gagal menambahkan alamat' });
  }
};

export const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const addressId = parseInt(id);
    const { label, recipientName, phone, province, city, district, postalCode, detailAddress, notes } = req.body;

    // Security: ensure this address belongs to the requesting user
    const existing = await prisma.address.findFirst({ where: { id: addressId, userId: req.userId } });
    if (!existing) {
      return res.status(404).json({ message: 'Alamat tidak ditemukan' });
    }

    const updated = await prisma.address.update({
      where: { id: addressId },
      data: {
        ...(label && { label }),
        ...(recipientName && { recipientName }),
        ...(phone && { phone }),
        ...(province !== undefined && { province }),
        ...(city !== undefined && { city }),
        ...(district !== undefined && { district }),
        ...(postalCode !== undefined && { postalCode }),
        ...(detailAddress && { detailAddress }),
        ...(notes !== undefined && { notes }),
      }
    });

    res.status(200).json({ message: 'Alamat berhasil diperbarui', address: updated });
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({ message: 'Gagal memperbarui alamat' });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const addressId = parseInt(id);

    const existing = await prisma.address.findFirst({ where: { id: addressId, userId: req.userId } });
    if (!existing) {
      return res.status(404).json({ message: 'Alamat tidak ditemukan' });
    }

    if (existing.isPrimary) {
      return res.status(400).json({ message: 'Tidak bisa menghapus alamat utama. Ubah alamat utama terlebih dahulu.' });
    }

    await prisma.address.delete({ where: { id: addressId } });
    res.status(200).json({ message: 'Alamat berhasil dihapus' });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({ message: 'Gagal menghapus alamat' });
  }
};

export const setPrimaryAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const addressId = parseInt(id);

    const existing = await prisma.address.findFirst({ where: { id: addressId, userId: req.userId } });
    if (!existing) {
      return res.status(404).json({ message: 'Alamat tidak ditemukan' });
    }

    // Atomic transaction: unset all primary then set the target
    await prisma.$transaction([
      prisma.address.updateMany({
        where: { userId: req.userId, isPrimary: true },
        data: { isPrimary: false },
      }),
      prisma.address.update({
        where: { id: addressId },
        data: { isPrimary: true },
      }),
    ]);

    const updatedAddresses = await prisma.address.findMany({
      where: { userId: req.userId },
      orderBy: [{ isPrimary: 'desc' }, { id: 'asc' }]
    });

    res.status(200).json({ message: 'Alamat utama berhasil diubah', addresses: updatedAddresses });
  } catch (error) {
    console.error('Set primary address error:', error);
    res.status(500).json({ message: 'Gagal mengubah alamat utama' });
  }
};
