const db = require('../config/db');
const slugify = require('slugify');

// Get all brands (public)
exports.getBrands = async (req, res) => {
  try {
    const brandsSnapshot = await db.collection('brands').where('is_active', '==', 1).get();
    
    const brands = [];
    brandsSnapshot.forEach(doc => {
      brands.push({ id: doc.id, ...doc.data() });
    });

    brands.sort((a, b) => a.name.localeCompare(b.name));
    res.json(brands);
  } catch (error) {
    console.error('Get brands error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get single brand
exports.getBrand = async (req, res) => {
  try {
    const { id } = req.params;
    let brandDoc;
    
    // Check if ID is a slug
    const isSlug = isNaN(id) && !id.match(/^[a-zA-Z0-9]{20}$/);
    
    if (isSlug) {
      const snapshot = await db.collection('brands').where('slug', '==', id).limit(1).get();
      if (!snapshot.empty) brandDoc = snapshot.docs[0];
    } else {
      brandDoc = await db.collection('brands').doc(id).get();
    }

    if (!brandDoc || !brandDoc.exists) {
      return res.status(404).json({ message: 'Brand not found.' });
    }
    
    res.json({ id: brandDoc.id, ...brandDoc.data() });
  } catch (error) {
    console.error('Get brand error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Create brand (admin)
exports.createBrand = async (req, res) => {
  try {
    const { name, logo, description, website } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required.' });

    const slug = slugify(name, { lower: true, strict: true });
    
    // Check duplicate
    const existing = await db.collection('brands').where('slug', '==', slug).get();
    if (!existing.empty) {
      return res.status(409).json({ message: 'Brand already exists.' });
    }

    const newBrand = {
      name,
      slug,
      logo: logo || null,
      description: description || null,
      website: website || null,
      is_active: 1,
      created_at: new Date()
    };

    const docRef = await db.collection('brands').add(newBrand);
    res.status(201).json({ message: 'Brand created.', id: docRef.id, slug });
  } catch (error) {
    console.error('Create brand error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Update brand (admin)
exports.updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, logo, description, website, is_active } = req.body;

    const updateData = {};
    if (name) {
      updateData.name = name;
      updateData.slug = slugify(name, { lower: true, strict: true });
    }
    if (logo !== undefined) updateData.logo = logo;
    if (description !== undefined) updateData.description = description;
    if (website !== undefined) updateData.website = website;
    if (is_active !== undefined) updateData.is_active = is_active ? 1 : 0;

    if (Object.keys(updateData).length === 0) return res.status(400).json({ message: 'No fields to update.' });

    await db.collection('brands').doc(id).update(updateData);
    res.json({ message: 'Brand updated.' });
  } catch (error) {
    console.error('Update brand error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Delete brand (admin)
exports.deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('brands').doc(id).delete();
    res.json({ message: 'Brand deleted.' });
  } catch (error) {
    console.error('Delete brand error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};
