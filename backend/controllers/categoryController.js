const db = require('../config/db');
const slugify = require('slugify');

// Get all categories (public)
exports.getCategories = async (req, res) => {
  try {
    const categoriesSnapshot = await db.collection('categories').where('is_active', '==', 1).get();
    
    // Get product counts dynamically
    const productsSnapshot = await db.collection('products').where('status', '==', 'active').get();
    const productCounts = {};
    productsSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.category_id) {
        productCounts[data.category_id] = (productCounts[data.category_id] || 0) + 1;
      }
    });

    const categories = [];
    categoriesSnapshot.forEach(doc => {
      const data = doc.data();
      categories.push({
        id: doc.id,
        ...data,
        product_count: productCounts[doc.id] || 0
      });
    });

    categories.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0) || a.name.localeCompare(b.name));
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get single category
exports.getCategory = async (req, res) => {
  try {
    const { id } = req.params;
    let categoryDoc;
    
    // Check if ID is a slug
    const isSlug = isNaN(id) && !id.match(/^[a-zA-Z0-9]{20}$/); // Simple check for firestore ID vs slug
    
    if (isSlug) {
      const snapshot = await db.collection('categories').where('slug', '==', id).limit(1).get();
      if (!snapshot.empty) categoryDoc = snapshot.docs[0];
    } else {
      categoryDoc = await db.collection('categories').doc(id).get();
    }

    if (!categoryDoc || !categoryDoc.exists) {
      return res.status(404).json({ message: 'Category not found.' });
    }
    
    res.json({ id: categoryDoc.id, ...categoryDoc.data() });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Create category (admin)
exports.createCategory = async (req, res) => {
  try {
    const { name, image, description, parent_id, sort_order } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required.' });

    const slug = slugify(name, { lower: true, strict: true });
    
    // Check duplicate
    const existing = await db.collection('categories').where('slug', '==', slug).get();
    if (!existing.empty) {
      return res.status(409).json({ message: 'Category already exists.' });
    }

    const newCategory = {
      name,
      slug,
      image: image || null,
      description: description || null,
      parent_id: parent_id || null,
      sort_order: sort_order || 0,
      is_active: 1,
      created_at: new Date()
    };

    const docRef = await db.collection('categories').add(newCategory);
    res.status(201).json({ message: 'Category created.', id: docRef.id, slug });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Update category (admin)
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, image, description, parent_id, sort_order, is_active } = req.body;

    const updateData = {};
    if (name) {
      updateData.name = name;
      updateData.slug = slugify(name, { lower: true, strict: true });
    }
    if (image !== undefined) updateData.image = image;
    if (description !== undefined) updateData.description = description;
    if (parent_id !== undefined) updateData.parent_id = parent_id;
    if (sort_order !== undefined) updateData.sort_order = sort_order;
    if (is_active !== undefined) updateData.is_active = is_active ? 1 : 0;

    if (Object.keys(updateData).length === 0) return res.status(400).json({ message: 'No fields to update.' });

    await db.collection('categories').doc(id).update(updateData);
    res.json({ message: 'Category updated.' });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Delete category (admin)
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('categories').doc(id).delete();
    res.json({ message: 'Category deleted.' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};
