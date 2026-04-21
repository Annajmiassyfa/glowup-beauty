import prisma from '../prisma.js';

export const createReview = async (req, res) => {
  try {
    const { productId, orderItemId, rating, comment } = req.body;
    const userId = req.userId;

    if (!productId || !rating) {
      return res.status(400).json({ message: 'Product ID and rating are required' });
    }

    // 1. Check if user has a Completed order for this product/item
    // If orderItemId is provided, check specifically for that item
    // Otherwise, check if any completed order contains this product
    const orderInclude = {
      where: {
        userId,
        orderStatus: 'Completed',
        items: {
          some: {
            productId: parseInt(productId),
            ...(orderItemId ? { id: parseInt(orderItemId) } : {})
          }
        }
      }
    };

    const eligibleOrder = await prisma.order.findFirst(orderInclude);

    if (!eligibleOrder) {
      return res.status(403).json({ message: 'You can only review products from completed orders' });
    }

    // 2. Prevent duplicate reviews for the same orderItem (if provided) or same user+product
    const existingReview = await prisma.review.findFirst({
      where: {
        userId,
        productId: parseInt(productId),
        ...(orderItemId ? { orderItemId: parseInt(orderItemId) } : {})
      }
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    // 3. Create review
    const review = await prisma.review.create({
      data: {
        userId,
        productId: parseInt(productId),
        orderItemId: orderItemId ? parseInt(orderItemId) : null,
        rating: parseInt(rating),
        comment: comment || ''
      },
      include: {
        user: {
          select: { name: true, avatar: true }
        }
      }
    });

    res.status(201).json({ message: 'Review submitted successfully', review });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ message: 'Server error while submitting review' });
  }
};

export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await prisma.review.findMany({
      where: { productId: parseInt(productId) },
      include: {
        user: {
          select: { name: true, avatar: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(reviews);
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ message: 'Server error while fetching reviews' });
  }
};

export const getHomeReviews = async (req, res) => {
  try {
    // Get latest high-rated reviews for the testimonials section
    const reviews = await prisma.review.findMany({
      where: { rating: { gte: 4 } },
      include: {
        user: {
          select: { name: true, avatar: true }
        },
        product: {
          select: { name: true }
        }
      },
      take: 6,
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(reviews);
  } catch (error) {
    console.error('Get home reviews error:', error);
    res.status(500).json({ message: 'Server error while fetching testimonials' });
  }
};
