import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function promoteAdmin(email) {
  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.log(`❌ User dengan email ${email} tidak ditemukan.`);
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { email },
      data: { role: 'Admin' }
    });

    console.log(`✅ Sukses! User ${updatedUser.name} (${updatedUser.email}) sekarang memiliki role: ${updatedUser.role}`);
  } catch (error) {
    console.error('❌ Gagal mengupdate user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// target email from request
promoteAdmin('annajmiassyfaa@gmail.com');
