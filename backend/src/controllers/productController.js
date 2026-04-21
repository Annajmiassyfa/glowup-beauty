import prisma from '../prisma.js';

// Helper: find or create brand by name string, returns id
const resolveBrand = async (brandName) => {
  if (!brandName) return null;
  const slug = brandName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const brand = await prisma.brand.upsert({
    where: { slug },
    create: { name: brandName.trim(), slug },
    update: { name: brandName.trim() } // Sync name if slug matches
  });
  return brand.id;
};

// Helper: find or create category by name string, returns id
const resolveCategory = async (categoryName) => {
  if (!categoryName) return null;
  const slug = categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const category = await prisma.category.upsert({
    where: { slug },
    create: { name: categoryName.trim(), slug },
    update: { name: categoryName.trim() } // Sync name if slug matches
  });
  return category.id;
};

// Normalizes a DB product to have flat `brand`, `category`, and `image` fields
// so the frontend can use them just like mock data
const normalizeProduct = (p) => {
  // Calculate total sold from completed orders
  const sold = p.orderItems?.reduce((acc, item) => {
    if (item.order?.orderStatus === 'Completed') return acc + item.qty;
    return acc;
  }, 0) || 0;

  // Calculate average rating and review count
  const reviews = p.reviews || [];
  const reviewCount = reviews.length;
  const avgRating = reviewCount > 0 
    ? parseFloat((reviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount).toFixed(1))
    : 0;

  const imageUrls = p.images?.map(img => img.imageUrl) || (p.image ? [p.image] : []);

  return {
    ...p,
    brand: p.brand?.name || (typeof p.brand === 'string' ? p.brand : null),
    category: p.category?.name || (typeof p.category === 'string' ? p.category : null),
    image: p.images?.find(i => i.isPrimary)?.imageUrl || p.images?.[0]?.imageUrl || p.image || null,
    images: imageUrls.length > 0 ? imageUrls : (p.image ? [p.image] : []),
    sold,
    rating: avgRating,
    reviews: reviewCount,
    orderItems: undefined, // cleanup
  };
};

export const getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: { 
        category: true, 
        brand: true, 
        images: true,
        orderItems: {
          include: { order: { select: { orderStatus: true } } }
        },
        reviews: {
          select: { rating: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(products.map(normalizeProduct));
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Gagal mengambil data produk' });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, price, compareAtPrice, stock, description, ingredients, usage, brand: brandName, category: categoryName } = req.body;

    if (!name || !price) {
      return res.status(400).json({ message: 'Nama dan harga produk wajib diisi' });
    }

    const brandId = await resolveBrand(brandName);
    const categoryId = await resolveCategory(categoryName);

    const productSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();

    const product = await prisma.product.create({
      data: {
        name,
        slug: productSlug,
        price: parseInt(price),
        compareAtPrice: compareAtPrice ? parseInt(compareAtPrice) : null,
        stock: stock ? parseInt(stock) : 0,
        description: description || '',
        ingredients: ingredients || '',
        usage: usage || '',
        brandId,
        categoryId,
      }
    });

    if (req.file) {
      const imageUrl = `/uploads/products/${req.file.filename}`;
      await prisma.productImage.create({
        data: { productId: product.id, imageUrl, isPrimary: true }
      });
    }

    const created = await prisma.product.findUnique({
      where: { id: product.id },
      include: { 
        category: true, 
        brand: true, 
        images: true,
        orderItems: {
          include: { order: { select: { orderStatus: true } } }
        },
        reviews: {
          select: { rating: true }
        }
      }
    });

    res.status(201).json({ message: 'Produk berhasil ditambahkan', product: normalizeProduct(created) });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Gagal menambahkan produk' });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, compareAtPrice, stock, description, ingredients, usage, brand: brandName, category: categoryName } = req.body;
    const productId = parseInt(id);

    const existing = await prisma.product.findUnique({ where: { id: productId } });
    if (!existing) return res.status(404).json({ message: 'Produk tidak ditemukan' });

    const brandId = brandName ? await resolveBrand(brandName) : undefined;
    const categoryId = categoryName ? await resolveCategory(categoryName) : undefined;

    const updateData = {};
    if (name) updateData.name = name;
    if (price) updateData.price = parseInt(price);
    if (compareAtPrice !== undefined) updateData.compareAtPrice = compareAtPrice ? parseInt(compareAtPrice) : null;
    if (stock !== undefined) updateData.stock = parseInt(stock) || 0;
    if (description !== undefined) updateData.description = description;
    if (ingredients !== undefined) updateData.ingredients = ingredients;
    if (usage !== undefined) updateData.usage = usage;
    if (brandId !== undefined) updateData.brandId = brandId;
    if (categoryId !== undefined) updateData.categoryId = categoryId;

    await prisma.product.update({ where: { id: productId }, data: updateData });

    if (req.file) {
      const imageUrl = `/uploads/products/${req.file.filename}`;
      await prisma.productImage.deleteMany({ where: { productId } });
      await prisma.productImage.create({
        data: { productId, imageUrl, isPrimary: true }
      });
    }

    const final = await prisma.product.findUnique({
      where: { id: productId },
      include: { 
        category: true, 
        brand: true, 
        images: true,
        orderItems: {
          include: { order: { select: { orderStatus: true } } }
        },
        reviews: {
          select: { rating: true }
        }
      }
    });

    res.status(200).json({ message: 'Produk berhasil diperbarui', product: normalizeProduct(final) });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Gagal memperbarui produk' });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const productId = parseInt(id);

    // 1. Check for relations (Orders)
    const orderCount = await prisma.orderItem.count({
      where: { productId }
    });

    if (orderCount > 0) {
      return res.status(400).json({ 
        message: 'Produk tidak bisa dihapus karena sudah memiliki riwayat transaksi/pesanan. Silakan deaktifkan produk saja jika ingin menyembunyikannya dari katalog.' 
      });
    }

    // 2. Safe to delete
    // ProductImages cascade-deleted via schema onDelete: Cascade
    await prisma.product.delete({ where: { id: productId } });
    res.status(200).json({ message: 'Produk berhasil dihapus' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Gagal menghapus produk' });
  }
};
