import prisma from '../prisma.js';

export const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    
    // We only allow updating name and phone for now
    const updatedUser = await prisma.user.update({
      where: { id: req.userId },
      data: {
        ...(name && { name }),
        ...(phone && { phone })
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        isMember: true,
        memberTier: true,
        memberSince: true,
        rewardPoints: true,
      }
    });

    res.status(200).json({ message: 'Profil berhasil diperbarui', user: updatedUser });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan sistem' });
  }
};

export const updateAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Tidak ada file gambar yang diunggah' });
    }

    // construct the url path, making sure we store relative path
    const avatarPath = `/uploads/avatars/${req.file.filename}`;

    const updatedUser = await prisma.user.update({
      where: { id: req.userId },
      data: { avatar: avatarPath },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        isMember: true
      }
    });

    res.status(200).json({ 
      message: 'Foto profil berhasil diperbarui', 
      user: updatedUser,
      avatarUrl: avatarPath 
    });
  } catch (error) {
    console.error('Update avatar error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan sistem saat unggah foto' });
  }
};

export const activateMembership = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, isMember: true }
    });

    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    if (user.isMember) {
      return res.status(400).json({ message: 'Membership Anda sudah aktif.' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.userId },
      data: {
        isMember: true,
        memberTier: 'Starter',
        memberSince: new Date(),
        rewardPoints: { increment: 100 }, // 100 welcome bonus points
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        isMember: true,
        memberTier: true,
        memberSince: true,
        rewardPoints: true,
      }
    });

    res.status(200).json({
      message: 'Selamat! Membership Glow Rewards berhasil diaktifkan.',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Activate membership error:', error);
    res.status(500).json({ message: 'Gagal mengaktifkan membership' });
  }
};
