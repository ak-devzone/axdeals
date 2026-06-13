const db = require('../config/db');
const slugify = require('slugify');

// Get all products (public, with basic search + filters)
exports.getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      brand,
      search,
      sort = 'newest',
      featured,
      trending,
      deal
    } = req.query;

    let query = db.collection('products').where('status', '==', 'active');

    if (featured === '1') query = query.where('is_featured', '==', 1);
    if (trending === '1') query = query.where('is_trending', '==', 1);
    if (deal === '1') query = query.where('is_deal', '==', 1);

    // Note: Firestore cannot easily filter by joined fields like category_slug natively unless we denormalize it.
    // For now, if category/brand filters are provided, we should first resolve their IDs.
    if (category) {
      const catSnap = await db.collection('categories').where('slug', '==', category).limit(1).get();
      if (!catSnap.empty) {
        query = query.where('category_id', '==', catSnap.docs[0].id);
      }
    }
    
    if (brand) {
      const brandSnap = await db.collection('brands').where('slug', '==', brand).limit(1).get();
      if (!brandSnap.empty) {
        query = query.where('brand_id', '==', brandSnap.docs[0].id);
      }
    }

    // Sorting - To avoid Firestore Composite Index requirements during migration, we will sort in-memory
    // if sort === 'price_low' query = query.orderBy('price', 'asc');
    // else if (sort === 'price_high' ... )

    const snapshot = await query.get();
    let products = [];
    
    snapshot.forEach(doc => {
      products.push({ id: doc.id, ...doc.data() });
    });

    // Client-side search and price filter since Firestore limits multi-field inequalities
    const { min_price, max_price } = req.query;
    if (min_price) products = products.filter(p => p.price >= Number(min_price));
    if (max_price) products = products.filter(p => p.price <= Number(max_price));
    
    if (search && search.trim()) {
      const raw = search.trim().toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(raw) || 
        (p.description && p.description.toLowerCase().includes(raw))
      );
    }

    // Fetch categories and brands to populate names (since we don't have SQL JOIN)
    const catMap = {};
    const brandMap = {};
    const cats = await db.collection('categories').get();
    const brnds = await db.collection('brands').get();
    cats.forEach(c => catMap[c.id] = c.data());
    brnds.forEach(b => brandMap[b.id] = b.data());

    products = products.map(p => ({
      ...p,
      category_name: p.category_id && catMap[p.category_id] ? catMap[p.category_id].name : null,
      category_slug: p.category_id && catMap[p.category_id] ? catMap[p.category_id].slug : null,
      brand_name: p.brand_id && brandMap[p.brand_id] ? brandMap[p.brand_id].name : null,
      brand_slug: p.brand_id && brandMap[p.brand_id] ? brandMap[p.brand_id].slug : null
    }));

    // In-memory sorting
    if (sort === 'price_low') products.sort((a, b) => a.price - b.price);
    else if (sort === 'price_high') products.sort((a, b) => b.price - a.price);
    else if (sort === 'rating') products.sort((a, b) => b.rating - a.rating);
    else if (sort === 'popular') products.sort((a, b) => b.review_count - a.review_count);
    else products.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Pagination
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const total = products.length;
    const paginatedProducts = products.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    res.json({
      products: paginatedProducts,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get single product
exports.getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    let productDoc;
    
    const isSlug = isNaN(id) && !id.match(/^[a-zA-Z0-9]{20}$/);
    
    if (isSlug) {
      const snapshot = await db.collection('products').where('slug', '==', id).limit(1).get();
      if (!snapshot.empty) productDoc = snapshot.docs[0];
    } else {
      productDoc = await db.collection('products').doc(id).get();
    }

    if (!productDoc || !productDoc.exists) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    const product = { id: productDoc.id, ...productDoc.data() };

    // Fetch category and brand names
    if (product.category_id) {
      const cat = await db.collection('categories').doc(product.category_id).get();
      if (cat.exists) {
        product.category_name = cat.data().name;
        product.category_slug = cat.data().slug;
      }
    }
    
    if (product.brand_id) {
      const brand = await db.collection('brands').doc(product.brand_id).get();
      if (brand.exists) {
        product.brand_name = brand.data().name;
        product.brand_slug = brand.data().slug;
      }
    }

    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Create product (admin)
exports.createProduct = async (req, res) => {
  try {
    const {
      name, description, price, original_price, image, images, videos,
      category_id, brand_id, is_featured, is_trending, is_deal,
      deal_expires_at, specifications, meta_title, meta_description,
      amazon_link, flipkart_link, croma_link, vijaysales_link, meesho_link, myntra_link, other_link, other_store_name
    } = req.body;

    if (!name || !price) {
      return res.status(400).json({ message: 'Name and price are required.' });
    }

    const slug = slugify(name, { lower: true, strict: true });
    
    // Check for duplicate slug
    const existing = await db.collection('products').where('slug', '==', slug).get();
    const finalSlug = !existing.empty ? `${slug}-${Date.now()}` : slug;

    const newProduct = {
      name,
      slug: finalSlug,
      description: description || null,
      price: Number(price),
      original_price: original_price ? Number(original_price) : null,
      image: image || null,
      images: images || [],
      videos: videos || [],
      category_id: category_id || null,
      brand_id: brand_id || null,
      is_featured: is_featured ? 1 : 0,
      is_trending: is_trending ? 1 : 0,
      is_deal: is_deal ? 1 : 0,
      deal_expires_at: deal_expires_at || null,
      specifications: specifications || null,
      meta_title: meta_title || null,
      meta_description: meta_description || null,
      status: 'active',
      rating: 0,
      review_count: 0,
      created_at: new Date(),
      updated_at: new Date(),
      // Store affiliate links directly in the product document
      affiliate_links: {
        amazon_link: amazon_link || null,
        flipkart_link: flipkart_link || null,
        croma_link: croma_link || null,
        vijaysales_link: vijaysales_link || null,
        meesho_link: meesho_link || null,
        myntra_link: myntra_link || null,
        other_link: other_link || null,
        other_store_name: other_store_name || null
      }
    };

    const docRef = await db.collection('products').add(newProduct);
    res.status(201).json({ message: 'Product created.', id: docRef.id, slug: finalSlug });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Update product (admin)
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name, description, price, original_price, image, images, videos,
      category_id, brand_id, is_featured, is_trending, is_deal,
      deal_expires_at, specifications, meta_title, meta_description, status,
      amazon_link, flipkart_link, croma_link, vijaysales_link, meesho_link, myntra_link, other_link, other_store_name
    } = req.body;

    const updateData = { updated_at: new Date() };

    if (name) {
      updateData.name = name;
      updateData.slug = slugify(name, { lower: true, strict: true });
    }
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = Number(price);
    if (original_price !== undefined) updateData.original_price = Number(original_price);
    if (image !== undefined) updateData.image = image;
    if (images !== undefined) updateData.images = images;
    if (videos !== undefined) updateData.videos = videos;
    if (category_id !== undefined) updateData.category_id = category_id;
    if (brand_id !== undefined) updateData.brand_id = brand_id;
    if (is_featured !== undefined) updateData.is_featured = is_featured ? 1 : 0;
    if (is_trending !== undefined) updateData.is_trending = is_trending ? 1 : 0;
    if (is_deal !== undefined) updateData.is_deal = is_deal ? 1 : 0;
    if (deal_expires_at !== undefined) updateData.deal_expires_at = deal_expires_at;
    if (specifications !== undefined) updateData.specifications = specifications;
    if (meta_title !== undefined) updateData.meta_title = meta_title;
    if (meta_description !== undefined) updateData.meta_description = meta_description;
    if (status !== undefined) updateData.status = status;

    // We will merge affiliate links
    if (amazon_link !== undefined || flipkart_link !== undefined || croma_link !== undefined || vijaysales_link !== undefined || meesho_link !== undefined || myntra_link !== undefined || other_link !== undefined) {
      updateData['affiliate_links.amazon_link'] = amazon_link || null;
      updateData['affiliate_links.flipkart_link'] = flipkart_link || null;
      updateData['affiliate_links.croma_link'] = croma_link || null;
      updateData['affiliate_links.vijaysales_link'] = vijaysales_link || null;
      updateData['affiliate_links.meesho_link'] = meesho_link || null;
      updateData['affiliate_links.myntra_link'] = myntra_link || null;
      updateData['affiliate_links.other_link'] = other_link || null;
      if (other_store_name !== undefined) updateData['affiliate_links.other_store_name'] = other_store_name || null;
    }

    if (Object.keys(updateData).length > 1) { // more than just updated_at
      await db.collection('products').doc(id).update(updateData);
    }

    res.json({ message: 'Product updated.' });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Delete product (admin)
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('products').doc(id).delete();
    // In NoSQL, we would also need to delete associated reviews, clicks, wishlists.
    // For simplicity, we just delete the product.
    res.json({ message: 'Product deleted.' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};
