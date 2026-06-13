const db = require('../config/db');

// Track click and return affiliate URL
exports.trackClick = async (req, res) => {
  try {
    const { product_id, platform } = req.body;

    if (!product_id || !platform) {
      return res.status(400).json({ message: 'product_id and platform are required.' });
    }

    const userId = req.user ? req.user.id : null;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || '';
    const referrer = req.headers.referer || '';

    // Log the click in Firestore
    await db.collection('click_tracking').add({
      user_id: userId,
      product_id,
      platform,
      ip_address: ipAddress,
      user_agent: userAgent,
      referrer,
      created_at: new Date()
    });

    // Get the product document to retrieve the embedded affiliate links
    const productDoc = await db.collection('products').doc(product_id).get();
    
    if (!productDoc.exists) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    const product = productDoc.data();
    const links = product.affiliate_links || {};

    let affiliateUrl = null;

    switch (platform.toLowerCase()) {
      case 'amazon': affiliateUrl = links.amazon_link; break;
      case 'flipkart': affiliateUrl = links.flipkart_link; break;
      case 'croma': affiliateUrl = links.croma_link; break;
      case 'vijaysales': affiliateUrl = links.vijaysales_link; break;
      case 'meesho': affiliateUrl = links.meesho_link; break;
      case 'myntra': affiliateUrl = links.myntra_link; break;
      case 'other': affiliateUrl = links.other_link; break;
      default: affiliateUrl = links.amazon_link;
    }

    if (!affiliateUrl) {
      return res.status(404).json({ message: `No ${platform} link available for this product.` });
    }

    res.json({ url: affiliateUrl });
  } catch (error) {
    console.error('Track click error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get click stats for a product
exports.getProductClicks = async (req, res) => {
  try {
    const { productId } = req.params;
    
    const clicksSnap = await db.collection('click_tracking').where('product_id', '==', productId).get();
    
    const aggregation = {};
    clicksSnap.forEach(doc => {
      const data = doc.data();
      const platform = data.platform;
      const dateObj = data.created_at?.toDate ? data.created_at.toDate() : new Date(data.created_at);
      if (isNaN(dateObj)) return;
      
      const dateStr = dateObj.toISOString().split('T')[0];
      const key = `${platform}_${dateStr}`;
      
      if (!aggregation[key]) {
        aggregation[key] = { platform, date: dateStr, total_clicks: 0 };
      }
      aggregation[key].total_clicks++;
    });

    const clicks = Object.values(aggregation).sort((a, b) => b.date.localeCompare(a.date));
    res.json(clicks);
  } catch (error) {
    console.error('Get clicks error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};
