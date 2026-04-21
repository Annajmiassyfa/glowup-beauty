export const BRANDS = ["Wardah", "Emina", "Viva", "OMG", "Implora", "Skintific"];
export const CATEGORIES = ["Skincare", "Makeup", "Body Care", "Hair Care", "Fragrance", "Tools"];

const generateProducts = () => {
  const products = [];
  const items = [
    { name: "Cushion Foundation SPF 50", sub: "Dewy Finish", cat: "Makeup" },
    { name: "Hyaluronic Acid Serum", sub: "Deep Hydration", cat: "Skincare" },
    { name: "Velvet Matte Lipstick", sub: "Long Lasting", cat: "Makeup" },
    { name: "Rose Water Toner", sub: "Soothing Mist", cat: "Skincare" },
    { name: "Keratin Repair Mask", sub: "Smooth & Shiny", cat: "Hair Care" },
    { name: "Oud & Bergamot Perfume", sub: "Eau de Parfum", cat: "Fragrance" },
    { name: "Jade Roller Set", sub: "Facial Tool", cat: "Tools" },
    { name: "Shea Butter Body Cream", sub: "24h Moisture", cat: "Body Care" },
    { name: "Retinol Night Cream", sub: "Anti-Aging", cat: "Skincare" },
    { name: "Waterproof Mascara", sub: "Volumizing", cat: "Makeup" }
  ];

  for (let i = 1; i <= 100; i++) {
    const base = items[i % items.length];
    const brand = BRANDS[i % BRANDS.length];
    const price = Math.floor(Math.random() * 800000) + 50000;
    // 30% of products will have a higher originalPrice (discounted)
    const hasDiscount = Math.random() > 0.7;
    const originalPrice = hasDiscount ? Math.floor(price * (1 + (Math.random() * 0.4 + 0.1))) : price;
    
    products.push({
      id: i,
      name: `${brand} ${base.name} #${i}`,
      brand: brand,
      category: base.cat,
      price: price,
      compareAtPrice: originalPrice > price ? originalPrice : null,
      rating: (Math.random() * 1.5 + 3.5).toFixed(1),
      reviews: Math.floor(Math.random() * 500),
      sold: Math.floor(Math.random() * 1000) + 10,
      stock: Math.floor(Math.random() * 50),
      image: `https://picsum.photos/seed/beauty${i}/400/500`,
      description: `Produk premium dari ${brand} yang dirancang khusus untuk memberikan hasil maksimal. Mengandung bahan-bahan alami berkualitas tinggi yang aman untuk kulit sensitif.`,
      ingredients: "Aqua, Glycerin, Niacinamide, Sodium Hyaluronate, Phenoxyethanol, Ethylhexylglycerin.",
      usage: "Aplikasikan pada wajah yang telah dibersihkan secara merata setiap pagi dan malam hari.",
      badge: i % 15 === 0 ? "Bestseller" : i % 20 === 0 ? "New" : null
    });
  }
  return products;
};

export const ALL_PRODUCTS = generateProducts();
