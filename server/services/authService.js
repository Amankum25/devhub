const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

class AuthService {
  constructor() {
    this.googleClient = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.API_BASE_URL || 'http://localhost:3000'}/api/auth/google/callback`
    );
  }

  /**
   * Verify Google ID token
   */
  async verifyGoogleToken(idToken) {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      return {
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        verified: payload.email_verified,
      };
    } catch (error) {
      console.error('Error verifying Google token:', error);
      throw new Error('Invalid Google token');
    }
  }

  /**
   * Create or update user from Google profile
   */
  async createOrUpdateGoogleUser(googleProfile) {
    try {
      let user = await User.findOne({
        $or: [
          { googleId: googleProfile.googleId },
          { email: googleProfile.email }
        ]
      });

      if (user) {
        // Update existing user
        user.googleId = googleProfile.googleId;
        user.picture = googleProfile.picture;
        user.lastLoginAt = new Date();
        user.authProvider = 'google';
        if (!user.verified && googleProfile.verified) {
          user.verified = true;
          user.emailVerified = true;
        }
        await user.save();
      } else {
        // Create new user
        const nameParts = googleProfile.name.split(' ');
        user = new User({
          googleId: googleProfile.googleId,
          email: googleProfile.email,
          username: await this.generateUniqueUsername(googleProfile.email),
          firstName: nameParts[0] || 'User',
          lastName: nameParts.slice(1).join(' ') || '',
          picture: googleProfile.picture,
          verified: googleProfile.verified,
          emailVerified: googleProfile.verified,
          lastLoginAt: new Date(),
          authProvider: 'google'
        });
        await user.save();
      }

      return user;
    } catch (error) {
      console.error('Error creating/updating Google user:', error);
      throw new Error('Failed to process Google user');
    }
  }

  /**
   * Generate JWT token for user
   */
  generateJWTToken(user) {
    const payload = {
      userId: user._id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
  }

  /**
   * Verify JWT token
   */
  verifyJWTToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Generate username from email
   */
  generateUsernameFromEmail(email) {
    const baseName = email.split('@')[0].toLowerCase();
    const randomSuffix = Math.floor(Math.random() * 1000);
    return `${baseName}${randomSuffix}`;
  }

  /**
   * Generate unique username from email
   */
  async generateUniqueUsername(email) {
    const baseName = email.split('@')[0].toLowerCase().replace(/[^a-zA-Z0-9_]/g, '');
    
    // Try the base name first
    let username = baseName;
    let user = await User.findOne({ username });
    
    // If username exists, add numbers until we find a unique one
    let counter = 1;
    while (user) {
      username = `${baseName}${counter}`;
      user = await User.findOne({ username });
      counter++;
    }
    
    return username;
  }

  /**
   * Get Google OAuth URL
   */
  getGoogleAuthUrl() {
    const scopes = [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ];

    return this.googleClient.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      include_granted_scopes: true,
    });
  }

  /**
   * Handle Google OAuth callback
   */
  async handleGoogleCallback(code) {
    try {
      const { tokens } = await this.googleClient.getToken(code);
      const idToken = tokens.id_token;

      if (!idToken) {
        throw new Error('No ID token received from Google');
      }

      const googleProfile = await this.verifyGoogleToken(idToken);
      const user = await this.createOrUpdateGoogleUser(googleProfile);
      const jwtToken = this.generateJWTToken(user);

      return {
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          name: user.name,
          picture: user.picture,
          verified: user.verified,
        },
        token: jwtToken,
      };
    } catch (error) {
      console.error('Error handling Google callback:', error);
      throw new Error('Google authentication failed');
    }
  }
}

module.exports = new AuthService();
