const db = require('../config/db');

// Get admin dashboard stats (extended analytics)
exports.getStats = async (req, res) => {
  try {
    // In NoSQL, getting total counts of large collections requires reading all documents 
    // unless using aggregation queries (available in newer Firebase versions) or keeping a separate counter.
    // For this migration, we will fetch snapshots and use `.size`.
    
    const productsSnap = await db.collection('products').get();
    const usersSnap = await db.collection('users').where('role', '==', 'user').get();
    const clicksSnap = await db.collection('click_tracking').get();
    const categoriesSnap = await db.collection('categories').get();
    const brandsSnap = await db.collection('brands').get();
    const reviewsSnap = await db.collection('reviews').get();

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonthDate = new Date(now);
    lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
    const lastMonth = lastMonthDate.getMonth();
    const lastMonthYear = lastMonthDate.getFullYear();

    let todayClicks = 0;
    let yesterdayClicks = 0;
    let monthClicks = 0;
    let lastMonthClicks = 0;
    
    const platformCount = {};
    const productClickCount = {};
    const brandClickCount = {};
    const categoryClickCount = {};
    const dailyClickCount = {};
    const hourlyClickCount = {};

    clicksSnap.forEach(doc => {
      const data = doc.data();
      const dateObj = data.created_at?.toDate ? data.created_at.toDate() : new Date(data.created_at);
      if (!dateObj || isNaN(dateObj)) return;

      const dateStr = dateObj.toISOString().split('T')[0];
      const month = dateObj.getMonth();
      const year = dateObj.getFullYear();
      const hour = dateObj.getHours();

      if (dateStr === todayStr) todayClicks++;
      if (dateStr === yesterdayStr) yesterdayClicks++;
      if (month === currentMonth && year === currentYear) monthClicks++;
      if (month === lastMonth && year === lastMonthYear) lastMonthClicks++;

      // Platform stats
      if (data.platform) {
        platformCount[data.platform] = (platformCount[data.platform] || 0) + 1;
      }

      // Product clicks
      if (data.product_id) {
        productClickCount[data.product_id] = (productClickCount[data.product_id] || 0) + 1;
      }

      // Daily and Hourly
      dailyClickCount[dateStr] = (dailyClickCount[dateStr] || 0) + 1;
      if (dateStr === todayStr) {
        hourlyClickCount[hour] = (hourlyClickCount[hour] || 0) + 1;
      }
    });

    let newUsersToday = 0;
    let newUsersMonth = 0;
    const dailyUserCount = {};
    const recentUsers = [];
    
    const usersList = [];
    usersSnap.forEach(doc => {
      const data = doc.data();
      usersList.push({ id: doc.id, ...data });
      const dateObj = data.created_at?.toDate ? data.created_at.toDate() : new Date(data.created_at);
      if (!dateObj || isNaN(dateObj)) return;
      const dateStr = dateObj.toISOString().split('T')[0];
      const month = dateObj.getMonth();
      const year = dateObj.getFullYear();

      if (dateStr === todayStr) newUsersToday++;
      if (month === currentMonth && year === currentYear) newUsersMonth++;
      dailyUserCount[dateStr] = (dailyUserCount[dateStr] || 0) + 1;
    });

    // Sort recent users
    usersList.sort((a, b) => b.created_at - a.created_at);
    recentUsers.push(...usersList.slice(0, 10));

    // Process products for top products and status breakdown
    const productsList = [];
    let featuredCount = 0;
    let trendingCount = 0;
    let dealCount = 0;
    const statusBreakdown = {};

    productsSnap.forEach(doc => {
      const data = doc.data();
      const p = { id: doc.id, ...data, click_count: productClickCount[doc.id] || 0 };
      productsList.push(p);

      statusBreakdown[data.status] = (statusBreakdown[data.status] || 0) + 1;
      
      if (data.status === 'active') {
        if (data.is_featured) featuredCount++;
        if (data.is_trending) trendingCount++;
        if (data.is_deal) dealCount++;
      }
      
      // Map to category and brand
      if (data.category_id) {
        categoryClickCount[data.category_id] = (categoryClickCount[data.category_id] || 0) + p.click_count;
      }
      if (data.brand_id) {
        brandClickCount[data.brand_id] = (brandClickCount[data.brand_id] || 0) + p.click_count;
      }
    });

    // Top products
    productsList.sort((a, b) => b.click_count - a.click_count);
    const topProducts = productsList.slice(0, 10);

    // Top categories
    const categoriesList = [];
    categoriesSnap.forEach(doc => {
      const data = doc.data();
      categoriesList.push({
        id: doc.id,
        name: data.name,
        image: data.image,
        click_count: categoryClickCount[doc.id] || 0
      });
    });
    categoriesList.sort((a, b) => b.click_count - a.click_count);
    const topCategories = categoriesList.slice(0, 8);

    // Top brands
    const brandsList = [];
    brandsSnap.forEach(doc => {
      const data = doc.data();
      brandsList.push({
        id: doc.id,
        name: data.name,
        logo: data.logo,
        click_count: brandClickCount[doc.id] || 0
      });
    });
    brandsList.sort((a, b) => b.click_count - a.click_count);
    const topBrands = brandsList.slice(0, 8);

    // Format arrays for response
    const platformStats = Object.keys(platformCount).map(k => ({ platform: k, total: platformCount[k] })).sort((a, b) => b.total - a.total);
    const productStatusBreakdown = Object.keys(statusBreakdown).map(k => ({ status: k, total: statusBreakdown[k] }));
    
    // Sort recent clicks (we need to get the last 15 clicks)
    const clicksList = [];
    clicksSnap.forEach(doc => {
      clicksList.push({ id: doc.id, ...doc.data() });
    });
    clicksList.sort((a, b) => b.created_at - a.created_at);
    const recentClicksRaw = clicksList.slice(0, 15);
    
    // Enrich recent clicks
    const recentClicks = recentClicksRaw.map(c => {
      const prod = productsList.find(p => p.id === c.product_id);
      const user = usersList.find(u => u.id === c.user_id);
      return {
        ...c,
        product_name: prod ? prod.name : 'Unknown',
        product_image: prod ? prod.image : null,
        user_name: user ? user.name : 'Guest'
      };
    });

    const dailyClicks = Object.keys(dailyClickCount).sort().map(d => ({ date: d, clicks: dailyClickCount[d] })).slice(-30);
    const dailyUsers = Object.keys(dailyUserCount).sort().map(d => ({ date: d, users: dailyUserCount[d] })).slice(-30);
    const hourlyClicks = Object.keys(hourlyClickCount).sort((a,b) => Number(a)-Number(b)).map(h => ({ hour: Number(h), clicks: hourlyClickCount[h] }));

    let pendingReviews = 0;
    reviewsSnap.forEach(doc => {
      if (doc.data().status === 'pending') pendingReviews++;
    });

    res.json({
      stats: {
        totalProducts: productsSnap.size,
        totalUsers: usersSnap.size,
        totalClicks: clicksSnap.size,
        totalCategories: categoriesSnap.size,
        totalBrands: brandsSnap.size,
        totalReviews: reviewsSnap.size,
        pendingReviews,
        todayClicks,
        yesterdayClicks,
        monthClicks,
        lastMonthClicks,
        newUsersToday,
        newUsersMonth,
        featuredProducts: featuredCount,
        trendingProducts: trendingCount,
        dealProducts: dealCount,
      },
      topProducts,
      topCategories,
      topBrands,
      platformStats,
      productStatusBreakdown,
      recentClicks,
      recentUsers,
      dailyClicks,
      dailyUsers,
      hourlyClicks,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get all users (admin)
exports.getUsers = async (req, res) => {
  try {
    const usersSnap = await db.collection('users').get();
    const users = [];
    usersSnap.forEach(doc => {
      const data = doc.data();
      users.push({
        id: doc.id,
        name: data.name,
        email: data.email,
        role: data.role,
        status: data.status,
        created_at: data.created_at
      });
    });
    users.sort((a, b) => b.created_at - a.created_at);
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Block/Unblock user (admin)
exports.toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await db.collection('users').doc(id).update({ status });
    res.json({ message: `User ${status === 'blocked' ? 'blocked' : 'activated'}.` });
  } catch (error) {
    console.error('Toggle user error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Change user role (admin)
exports.changeUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const validRoles = ['user', 'admin', 'content_manager', 'marketing_manager', 'support'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role.' });
    }
    await db.collection('users').doc(id).update({ role });
    res.json({ message: 'User role updated.' });
  } catch (error) {
    console.error('Change role error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Delete user (admin)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    // Basic check to prevent deleting an admin, though proper security rules should handle this
    const userDoc = await db.collection('users').doc(id).get();
    if (userDoc.exists && userDoc.data().role !== 'admin') {
      await db.collection('users').doc(id).delete();
    }
    res.json({ message: 'User deleted.' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Role-specific lightweight stats
exports.getMyStats = async (req, res) => {
  try {
    const role = req.user.role;
    const data = {};

    // For simplicity in NoSQL, we return basic empty data here or re-use full stats logic.
    // Given the complexity of NoSQL reporting, we'll return a stub or basic count.
    
    const [totalProducts, totalCategories, totalBrands] = await Promise.all([
      db.collection('products').where('status', '==', 'active').get(),
      db.collection('categories').where('is_active', '==', 1).get(),
      db.collection('brands').where('is_active', '==', 1).get(),
    ]);

    data.totalProducts = totalProducts.size;
    data.totalCategories = totalCategories.size;
    data.totalBrands = totalBrands.size;

    res.json({ role, stats: data });
  } catch (error) {
    console.error('My stats error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};
