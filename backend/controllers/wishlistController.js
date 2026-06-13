const db = require('../config/db');

// GET /api/wishlist  — fetch all wishlist items for the logged-in user
exports.getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get all wishlist entries for user
    const wishlistSnap = await db.collection('wishlists')
      .where('user_id', '==', userId)
      .get();
      
    if (wishlistSnap.empty) {
      return res.json([]);
    }

    let wishlistItems = [];
    wishlistSnap.forEach(doc => {
      wishlistItems.push({ wishlist_id: doc.id, ...doc.data() });
    });

    // Sort in memory to avoid Firestore composite index requirements
    wishlistItems.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // In NoSQL, we must fetch the referenced products manually.
    // Fetch categories and brands for mapping
    const catMap = {};
    const brandMap = {};
    const [catsSnap, brandsSnap] = await Promise.all([
      db.collection('categories').get(),
      db.collection('brands').get()
    ]);
    
    catsSnap.forEach(c => catMap[c.id] = c.data());
    brandsSnap.forEach(b => brandMap[b.id] = b.data());

    // Fetch all products in the wishlist
    // Firestore 'in' query supports up to 30 items, so we might need chunking if large, 
    // but for simple migration we can fetch them individually or use chunking.
    const productIds = wishlistItems.map(item => item.product_id);
    const productsData = {};
    
    // Chunking productIds into groups of 30 for 'in' queries
    const chunks = [];
    for (let i = 0; i < productIds.length; i += 30) {
      chunks.push(productIds.slice(i, i + 30));
    }
    
    for (const chunk of chunks) {
      if (chunk.length === 0) continue;
      const prodsSnap = await db.collection('products').where('__name__', 'in', chunk).get();
      prodsSnap.forEach(doc => {
        productsData[doc.id] = doc.data();
      });
    }

    // Combine data
    const rows = wishlistItems.map(item => {
      const p = productsData[item.product_id];
      if (!p) return null; // Product might have been deleted
      return {
        wishlist_id: item.wishlist_id,
        saved_at: item.created_at,
        id: item.product_id,
        name: p.name,
        slug: p.slug,
        image: p.image,
        price: p.price,
        original_price: p.original_price,
        rating: p.rating,
        review_count: p.review_count,
        is_deal: p.is_deal,
        is_featured: p.is_featured,
        is_trending: p.is_trending,
        status: p.status,
        category_name: p.category_id && catMap[p.category_id] ? catMap[p.category_id].name : null,
        category_slug: p.category_id && catMap[p.category_id] ? catMap[p.category_id].slug : null,
        brand_name: p.brand_id && brandMap[p.brand_id] ? brandMap[p.brand_id].name : null
      };
    }).filter(item => item !== null);

    res.json(rows);
  } catch (error) {
    console.error('Wishlist get error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// POST /api/wishlist/:productId  — add product to wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const userId    = req.user.id;
    const productId = req.params.productId;

    // Verify product exists
    const productDoc = await db.collection('products').doc(productId).get();
    if (!productDoc.exists) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    // Check if already in wishlist
    const existing = await db.collection('wishlists')
      .where('user_id', '==', userId)
      .where('product_id', '==', productId)
      .limit(1)
      .get();

    if (existing.empty) {
      await db.collection('wishlists').add({
        user_id: userId,
        product_id: productId,
        created_at: new Date()
      });
    }
    
    // If it's not a number in Firestore, we just return the string ID
    res.status(201).json({ message: 'Added to wishlist.', product_id: productId });
  } catch (error) {
    console.error('Wishlist add error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// DELETE /api/wishlist/:productId  — remove product from wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    const userId    = req.user.id;
    const productId = req.params.productId;
    
    const existing = await db.collection('wishlists')
      .where('user_id', '==', userId)
      .where('product_id', '==', productId)
      .get();
      
    const batch = db.batch();
    existing.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    
    res.json({ message: 'Removed from wishlist.', product_id: productId });
  } catch (error) {
    console.error('Wishlist remove error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// GET /api/wishlist/ids  — return only product IDs for quick heart-state lookup
exports.getWishlistIds = async (req, res) => {
  try {
    const userId = req.user.id;
    const snap = await db.collection('wishlists')
      .where('user_id', '==', userId)
      .get();
      
    const ids = [];
    snap.forEach(doc => {
      ids.push(doc.data().product_id);
    });
    res.json(ids);
  } catch (error) {
    console.error('Wishlist ids error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};
