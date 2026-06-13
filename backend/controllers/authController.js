const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const admin = require('firebase-admin');

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, adminSecret } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Check admin secret if role is admin
    const userRole = role === 'admin' ? 'admin' : 'user';
    if (userRole === 'admin') {
      if (!adminSecret || adminSecret !== process.env.ADMIN_REGISTRATION_SECRET) {
        return res.status(403).json({ message: 'Invalid admin registration secret.' });
      }
    }

    // Check if user exists
    const existingRef = await db.collection('users').where('email', '==', email).limit(1).get();
    if (!existingRef.empty) {
      return res.status(409).json({ message: 'Email already registered.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const userDoc = await db.collection('users').add({
      name,
      email,
      password: hashedPassword,
      role: userRole,
      status: 'active',
      avatar: null,
      created_at: new Date()
    });

    // Generate token
    const token = jwt.sign(
      { id: userDoc.id, email, role: userRole, name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Registration successful.',
      token,
      user: { id: userDoc.id, name, email, role: userRole }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // Find user
    const usersRef = await db.collection('users').where('email', '==', email).limit(1).get();
    if (usersRef.empty) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const userDoc = usersRef.docs[0];
    const user = { id: userDoc.id, ...userDoc.data() };

    // Check if blocked
    if (user.status === 'blocked') {
      return res.status(403).json({ message: 'Account has been blocked.' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful.',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get current user profile
exports.getProfile = async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.user.id).get();
    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User not found.' });
    }
    const data = userDoc.data();
    res.json({
      id: userDoc.id,
      name: data.name,
      email: data.email,
      role: data.role,
      avatar: data.avatar,
      created_at: data.created_at
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Google Login
exports.googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ message: 'ID token is required.' });
    }

    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;

    if (!email) {
      return res.status(400).json({ message: 'Google account has no email.' });
    }

    // Check if user exists in our Firestore users collection
    const usersRef = await db.collection('users').where('email', '==', email).limit(1).get();
    let userId;
    let userRole = 'user';
    let userAvatar = picture;
    let userName = name || email.split('@')[0];

    if (usersRef.empty) {
      // Create new user
      const userDoc = await db.collection('users').add({
        name: userName,
        email: email,
        password: null, // Google users don't have a password
        role: userRole,
        status: 'active',
        avatar: picture || null,
        created_at: new Date()
      });
      userId = userDoc.id;
    } else {
      // User exists
      const existingUser = usersRef.docs[0];
      const data = existingUser.data();
      userId = existingUser.id;
      userRole = data.role;
      userAvatar = data.avatar || picture;
      userName = data.name;

      if (data.status === 'blocked') {
        return res.status(403).json({ message: 'Account has been blocked.' });
      }

      // Update avatar if they didn't have one
      if (!data.avatar && picture) {
        await db.collection('users').doc(userId).update({ avatar: picture });
      }
    }

    // Generate our standard session JWT
    const token = jwt.sign(
      { id: userId, email, role: userRole, name: userName },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Google login successful.',
      token,
      user: { id: userId, name: userName, email, role: userRole, avatar: userAvatar }
    });
  } catch (error) {
    console.error('Google Login error:', error);
    res.status(401).json({ message: 'Invalid or expired Google token.' });
  }
};
