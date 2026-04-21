import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Create Admin User
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@glowup.com' },
    update: {},
    create: {
      email: 'admin@glowup.com',
      name: 'Admin GlowUp',
      password: adminPassword,
      role: 'Admin',
      isMember: true,
      memberTier: 'VIP'
    }
  });
  console.log('Admin account created: admin@glowup.com / admin123');

  // 2. Create Categories
  const categories = ['Skincare', 'Makeup', 'Body Care', 'Hair Care'];
  for (const catName of categories) {
    await prisma.category.upsert({
      where: { slug: catName.toLowerCase().replace(' ', '-') },
      update: {},
      create: {
        name: catName,
        slug: catName.toLowerCase().replace(' ', '-'),
        description: `Produk-produk ${catName} berkualitas.`
      }
    });
  }

  // 3. Create Brands
  const brands = ['Wardah', 'Skintific', 'Emina'];
  for (const brandName of brands) {
    await prisma.brand.upsert({
      where: { slug: brandName.toLowerCase() },
      update: {},
      create: {
        name: brandName,
        slug: brandName.toLowerCase()
      }
    });
  }

  // 4. Create Initial Products
  const initialProducts = [
    {
      name: 'Cushion Foundation SPF 50',
      brandSlug: 'wardah',
      categorySlug: 'makeup',
      price: 125000,
      stock: 50,
      description: 'Dewy finish cushion with high SPF protection.'
    },
    {
      name: 'Hyaluronic Acid Serum',
      brandSlug: 'skintific',
      categorySlug: 'skincare',
      price: 189000,
      stock: 40,
      description: 'Deep hydrating serum for all skin types.'
    },
    {
      name: 'Bright Stuff Face Wash',
      brandSlug: 'emina',
      categorySlug: 'skincare',
      price: 25000,
      stock: 100,
      description: 'Gentle brightening face wash for teens.'
    }
  ];

  for (const p of initialProducts) {
    const brand = await prisma.brand.findUnique({ where: { slug: p.brandSlug } });
    const category = await prisma.category.findUnique({ where: { slug: p.categorySlug } });

    await prisma.product.upsert({
      where: { slug: p.name.toLowerCase().replace(/ /g, '-') },
      update: {},
      create: {
        name: p.name,
        slug: p.name.toLowerCase().replace(/ /g, '-'),
        price: p.price,
        stock: p.stock,
        description: p.description,
        isActive: true,
        brandId: brand?.id,
        categoryId: category?.id
      }
    });
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
