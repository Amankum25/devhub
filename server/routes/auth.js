const express = require("express");
const bcrypt = require("bcrypt");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const {
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
  createSession,
  updateLastLogin,
  invalidateSession,
  authenticateToken,
} = require("../middleware/auth");
const {
  AppError,
  catchAsync,
  createValidationError,
} = require("../middleware/errorHandler");

const router = express.Router();

// Validation middleware
const registerValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    ),
  body("firstName")
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("First name is required and must be less than 50 characters"),
  body("lastName")
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Last name is required and must be less than 50 characters"),
  body("username")
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 })
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage(
      "Username must be 3-30 characters and contain only letters, numbers, and underscores",
    ),
];

const loginValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
];

// Helper function to check validation results
const checkValidation = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0];
    throw createValidationError(firstError.msg, firstError.path);
  }
};

// Register endpoint
router.post(
  "/register",
  registerValidation,
  catchAsync(async (req, res) => {
    checkValidation(req);

    const { email, password, firstName, lastName, username, avatar, bio } =
      req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError(
        "User with this email already exists",
        409,
        "EMAIL_EXISTS",
      );
    }

    // Check if username is taken (if provided)
    if (username) {
      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        throw new AppError("Username is already taken", 409, "USERNAME_EXISTS");
      }
    }

    // Generate unique username if not provided
    let finalUsername = username;
    if (!finalUsername) {
      finalUsername = `${firstName.toLowerCase()}${lastName.toLowerCase()}${Math.random().toString(36).substr(2, 6)}`;
      
      // Make sure generated username is unique
      let usernameExists = await User.findOne({ username: finalUsername });
      while (usernameExists) {
        finalUsername = `${firstName.toLowerCase()}${lastName.toLowerCase()}${Math.random().toString(36).substr(2, 6)}`;
        usernameExists = await User.findOne({ username: finalUsername });
      }
    }

    // Create user
    const newUser = new User({
      email,
      password, // Will be hashed by the pre-save middleware
      firstName,
      lastName,
      username: finalUsername,
      avatar: avatar || null,
      bio: bio || null,
      emailVerified: false,
      authProvider: 'local'
    });

    await newUser.save();

    // Generate tokens
    const tokenPayload = { userId: newUser._id, email, isAdmin: newUser.isAdmin };
    const token = generateToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Create session
    const sessionId = await createSession(
      newUser._id.toString(),
      token,
      refreshToken,
      req.get("User-Agent"),
      req.ip,
    );

    // Update last login
    newUser.lastLoginAt = new Date();
    await newUser.save();

    // Get user data (without password)
    const userResponse = {
      id: newUser._id,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      username: newUser.username,
      avatar: newUser.avatar,
      bio: newUser.bio,
      isAdmin: newUser.isAdmin,
      createdAt: newUser.createdAt
    };

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: userResponse,
        token,
        refreshToken,
        sessionId,
      },
    });
  }),
);

// Login endpoint
router.post(
  "/login",
  loginValidation,
  catchAsync(async (req, res) => {
    checkValidation(req);

    const { email, password, rememberMe } = req.body;

    // Debug logging
    console.log('🔍 Login attempt:', {
      email: email,
      passwordLength: password ? password.length : 0,
      hasPassword: !!password,
      rememberMe: rememberMe
    });

    // Find user
    const user = await User.findOne({ email }).select('+password');

    console.log('👤 User found:', {
      found: !!user,
      email: user ? user.email : 'N/A',
      isActive: user ? user.isActive : 'N/A',
      hasPassword: user ? !!user.password : 'N/A'
    });

    if (!user) {
      console.log('❌ User not found for email:', email);
      throw new AppError(
        "Invalid email or password",
        401,
        "INVALID_CREDENTIALS",
      );
    }

    if (!user.isActive) {
      throw new AppError(
        "Account has been deactivated. Please contact support.",
        403,
        "ACCOUNT_DEACTIVATED",
      );
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log('🔑 Password check:', {
      inputPassword: password,
      isValid: isValidPassword,
      storedHashPrefix: user.password ? user.password.substring(0, 20) + '...' : 'NO PASSWORD'
    });
    
    if (!isValidPassword) {
      console.log('❌ Password mismatch for user:', email);
      throw new AppError(
        "Invalid email or password",
        401,
        "INVALID_CREDENTIALS",
      );
    }

    // Generate tokens
    const tokenPayload = {
      userId: user._id,
      email: user.email,
      isAdmin: user.isAdmin,
    };
    const token = generateToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Create session
    const sessionId = await createSession(
      user._id.toString(),
      token,
      refreshToken,
      req.get("User-Agent"),
      req.ip,
    );

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    // Prepare user response (without password)
    const userResponse = {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      avatar: user.avatar,
      bio: user.bio,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt
    };

    res.json({
      success: true,
      message: "Login successful",
      data: {
        user: userResponse,
        token,
        refreshToken,
        sessionId,
      },
    });
  }),
);

// Refresh token endpoint
router.post(
  "/refresh",
  catchAsync(async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError(
        "Refresh token is required",
        400,
        "REFRESH_TOKEN_REQUIRED",
      );
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (error) {
      throw new AppError("Invalid refresh token", 401, "INVALID_REFRESH_TOKEN");
    }

    // Get user from MongoDB
    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    // Generate new tokens
    const tokenPayload = {
      userId: user._id,
      email: user.email,
      isAdmin: user.isAdmin,
    };
    const newToken = generateToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    // Prepare user response
    const userResponse = {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      avatar: user.avatar,
      bio: user.bio,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt
    };

    res.json({
      success: true,
      message: "Token refreshed successfully",
      data: {
        user: userResponse,
        token: newToken,
        refreshToken: newRefreshToken,
      },
    });
  }),
);

// Logout endpoint
router.post(
  "/logout",
  authenticateToken,
  catchAsync(async (req, res) => {
    // Invalidate current session
    await invalidateSession(req.sessionId);

    res.json({
      success: true,
      message: "Logout successful",
    });
  }),
);

// Logout all devices
router.post(
  "/logout-all",
  authenticateToken,
  catchAsync(async (req, res) => {
    const UserSession = require("../models/UserSession");

    // Invalidate all user sessions
    await UserSession.updateMany(
      { user: req.user.userId },
      { isActive: false }
    );

    res.json({
      success: true,
      message: "Logged out from all devices successfully",
    });
  }),
);

// Get current user
router.get(
  "/me",
  authenticateToken,
  catchAsync(async (req, res) => {
    const user = await User.findById(req.user.userId);

    if (!user) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    // Prepare user response
    const userResponse = {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      avatar: user.avatar,
      bio: user.bio,
      location: user.location,
      website: user.website,
      company: user.company,
      position: user.position,
      github: user.github,
      linkedin: user.linkedin,
      twitter: user.twitter,
      skills: user.skills || [],
      isAdmin: user.isAdmin,
      emailVerified: user.emailVerified,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.json({
      success: true,
      data: { user: userResponse },
    });
  }),
);

// Update profile
router.patch(
  "/profile",
  authenticateToken,
  [
    body("firstName")
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage("First name must be less than 50 characters"),
    body("lastName")
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage("Last name must be less than 50 characters"),
    body("bio")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Bio must be less than 500 characters"),
    body("location")
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage("Location must be less than 100 characters"),
    body("website")
      .optional()
      .isURL()
      .withMessage("Website must be a valid URL"),
    body("skills").optional().isArray().withMessage("Skills must be an array"),
  ],
  catchAsync(async (req, res) => {
    checkValidation(req);

    const {
      firstName,
      lastName,
      bio,
      location,
      website,
      company,
      position,
      github,
      linkedin,
      twitter,
      skills,
    } = req.body;

    // Build update object
    const updates = {};

    if (firstName !== undefined) updates.firstName = firstName;
    if (lastName !== undefined) updates.lastName = lastName;
    if (bio !== undefined) updates.bio = bio;
    if (location !== undefined) updates.location = location;
    if (website !== undefined) updates.website = website;
    if (company !== undefined) updates.company = company;
    if (position !== undefined) updates.position = position;
    if (github !== undefined) updates.github = github;
    if (linkedin !== undefined) updates.linkedin = linkedin;
    if (twitter !== undefined) updates.twitter = twitter;
    if (skills !== undefined) updates.skills = skills;

    if (Object.keys(updates).length === 0) {
      throw new AppError("No fields to update", 400, "NO_UPDATES");
    }

    // Update user
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      updates,
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: { user },
    });
  }),
);

// Change password
router.patch(
  "/change-password",
  authenticateToken,
  [
    body("currentPassword")
      .notEmpty()
      .withMessage("Current password is required"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters long")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage(
        "New password must contain at least one uppercase letter, one lowercase letter, and one number",
      ),
  ],
  catchAsync(async (req, res) => {
    checkValidation(req);

    const { currentPassword, newPassword } = req.body;
    const UserSession = require("../models/UserSession");

    // Get user with password
    const user = await User.findById(req.user.userId).select("+password");

    if (!user) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isValidPassword) {
      throw new AppError(
        "Current password is incorrect",
        400,
        "INVALID_CURRENT_PASSWORD",
      );
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    user.password = hashedPassword;
    await user.save();

    // Invalidate all other sessions (keep current session)
    await UserSession.updateMany(
      { 
        user: req.user.userId,
        _id: { $ne: req.sessionId }
      },
      { isActive: false }
    );

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  }),
);

// Google Authentication Routes
const authService = require('../services/authService');

/**
 * @route   POST /api/auth/google
 * @desc    Authenticate with Google ID token
 * @access  Public
 */
router.post('/google', catchAsync(async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    throw new AppError('Google ID token is required', 400);
  }

  try {
    // Verify Google token and get user info
    const googleProfile = await authService.verifyGoogleToken(idToken);
    
    // Check if user exists by email or Google ID
    let user = await User.findOne({
      $or: [
        { email: googleProfile.email },
        { googleId: googleProfile.googleId }
      ]
    });

    if (user) {
      // Update existing user with Google info
      user.googleId = googleProfile.googleId;
      user.picture = googleProfile.picture;
      user.lastLoginAt = new Date();
      user.verified = true;
      await user.save();
    } else {
      // Create new user
      const username = authService.generateUsernameFromEmail(googleProfile.email);
      const nameParts = googleProfile.name.split(' ');
      
      user = new User({
        email: googleProfile.email,
        username: username,
        firstName: nameParts[0] || 'User',
        lastName: nameParts.slice(1).join(' ') || '',
        picture: googleProfile.picture,
        googleId: googleProfile.googleId,
        verified: true,
        emailVerified: true,
        authProvider: 'google',
        lastLoginAt: new Date(),
      });
      
      await user.save();
    }

    // Generate tokens
    const tokenPayload = { 
      userId: user._id, 
      email: user.email, 
      isAdmin: user.isAdmin 
    };
    const token = generateToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);
    
    // Create session
    const sessionId = await createSession(
      user._id.toString(),
      token,
      refreshToken,
      req.get("User-Agent"),
      req.ip
    );

    res.json({
      success: true,
      message: 'Google authentication successful',
      data: {
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          picture: user.picture,
          verified: user.verified,
        },
        token,
        refreshToken,
        sessionId,
      },
    });
  } catch (error) {
    console.error('Google auth error:', error);
    throw new AppError(error.message || 'Google authentication failed', 400);
  }
}));

/**
 * @route   GET /api/auth/google/url
 * @desc    Get Google OAuth URL
 * @access  Public
 */
router.get('/google/url', (req, res) => {
  try {
    const authUrl = authService.getGoogleAuthUrl();
    res.json({
      success: true,
      data: { authUrl },
    });
  } catch (error) {
    console.error('Error generating Google auth URL:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate Google auth URL',
    });
  }
});

/**
 * @route   GET /api/auth/google/callback
 * @desc    Handle Google OAuth callback
 * @access  Public
 */
router.get('/google/callback', catchAsync(async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:8080'}/login?error=no_code`);
  }

  try {
    const result = await authService.handleGoogleCallback(code);
    
    // Redirect to frontend with token
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:8080'}/auth/callback?token=${result.token}`);
  } catch (error) {
    console.error('Google callback error:', error);
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:8080'}/login?error=auth_failed`);
  }
}));

module.exports = router;
