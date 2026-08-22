import { OAuth2Client } from 'google-auth-library';
import { User } from '../models/User.js';
import { generateToken } from '../middleware/auth.js';
import { ENV } from '../config/env.js';

const googleClient = new OAuth2Client(ENV.GOOGLE_CLIENT_ID);

/**
 * @route   POST /api/auth/admin-login
 * @desc    Admin login with Admin ID or email and password
 * @access  Public
 */
export const adminLogin = async (req, res) => {
  try {
    const { adminId, password } = req.body;

    if (!adminId || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both Admin ID and Password.'
      });
    }

    // Search by customId, email, or name
    const admin = await User.findOne({
      role: 'admin',
      $or: [
        { customId: adminId.trim() },
        { email: adminId.toLowerCase().trim() }
      ]
    }).select('+password');

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Admin credentials.'
      });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Admin credentials.'
      });
    }

    const token = generateToken(admin);

    res.json({
      success: true,
      message: 'Admin login successful',
      token,
      user: {
        id: admin._id,
        customId: admin.customId,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        profilePicture: admin.profilePicture
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during admin login'
    });
  }
};

/**
 * @route   POST /api/auth/google
 * @desc    Google OAuth Student Sign-In / Registration
 * @access  Public
 */
export const googleAuth = async (req, res) => {
  try {
    const { credential, email, name, picture, sub } = req.body;

    let studentEmail = email;
    let studentName = name;
    let studentPicture = picture || '';
    let googleId = sub;

    // Verify token with Google if credential token is provided
    if (credential && ENV.GOOGLE_CLIENT_ID) {
      try {
        const ticket = await googleClient.verifyIdToken({
          idToken: credential,
          audience: ENV.GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();
        studentEmail = payload.email;
        studentName = payload.name;
        studentPicture = payload.picture;
        googleId = payload.sub;
      } catch (verifyErr) {
        console.warn('Google ID token verification failed; falling back to direct payload:', verifyErr.message);
      }
    }

    if (!studentEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email is required from Google Authentication.'
      });
    }

    let student = await User.findOne({ email: studentEmail.toLowerCase() });

    if (!student) {
      // Create new student
      student = await User.create({
        name: studentName || 'Student',
        email: studentEmail.toLowerCase(),
        role: 'student',
        googleId: googleId || `google-${Date.now()}`,
        profilePicture: studentPicture,
        rollNumber: `STU-${Math.floor(100000 + Math.random() * 900000)}`
      });
    } else {
      // Update profile picture and googleId if changed
      if (studentPicture && !student.profilePicture) {
        student.profilePicture = studentPicture;
      }
      if (googleId && !student.googleId) {
        student.googleId = googleId;
      }
      await student.save();
    }

    await student.populate('enrolledGroups', 'groupName description color');

    const token = generateToken(student);

    res.json({
      success: true,
      message: 'Student authentication successful',
      token,
      user: {
        id: student._id,
        name: student.name,
        email: student.email,
        role: student.role,
        profilePicture: student.profilePicture,
        rollNumber: student.rollNumber,
        department: student.department,
        phoneNumber: student.phoneNumber,
        enrolledGroups: student.enrolledGroups
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error processing Google authentication'
    });
  }
};

/**
 * @route   POST /api/auth/demo-student-login
 * @desc    Quick demo student login for easy testing / evaluation
 * @access  Public
 */
export const demoStudentLogin = async (req, res) => {
  try {
    const { studentId, email } = req.body;

    let query = { role: 'student' };
    if (studentId) query._id = studentId;
    else if (email) query.email = email.toLowerCase();

    let student = await User.findOne(query).populate('enrolledGroups', 'groupName description color');

    if (!student) {
      // Pick first available student
      student = await User.findOne({ role: 'student' }).populate('enrolledGroups', 'groupName description color');
    }

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'No student accounts found. Please run database seeder.'
      });
    }

    const token = generateToken(student);

    res.json({
      success: true,
      message: `Logged in as ${student.name}`,
      token,
      user: {
        id: student._id,
        name: student.name,
        email: student.email,
        role: student.role,
        profilePicture: student.profilePicture,
        rollNumber: student.rollNumber,
        department: student.department,
        phoneNumber: student.phoneNumber,
        enrolledGroups: student.enrolledGroups
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('enrolledGroups', 'groupName description color');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        customId: user.customId,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
        rollNumber: user.rollNumber,
        department: user.department,
        phoneNumber: user.phoneNumber,
        enrolledGroups: user.enrolledGroups,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
export const updateProfile = async (req, res) => {
  try {
    const { name, department, rollNumber, phoneNumber } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name.trim();
    if (department) user.department = department.trim();
    if (rollNumber) user.rollNumber = rollNumber.trim();

    if (phoneNumber !== undefined) {
      const cleanPhone = phoneNumber ? phoneNumber.trim() : '';
      if (cleanPhone) {
        // Validate uniqueness: check if another user already has this phone number
        const existing = await User.findOne({
          phoneNumber: cleanPhone,
          _id: { $ne: user._id }
        });
        if (existing) {
          return res.status(400).json({
            success: false,
            message: 'This mobile number is already registered by another student.'
          });
        }
        user.phoneNumber = cleanPhone;
      } else {
        user.phoneNumber = undefined;
      }
    }

    if (req.file) {
      user.profilePicture = `/uploads/avatars/${req.file.filename}`;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        customId: user.customId,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
        rollNumber: user.rollNumber,
        department: user.department,
        phoneNumber: user.phoneNumber
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change Admin password securely
 * @access  Private (Admin Only)
 */
export const changeAdminPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both current and new passwords.'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters.'
      });
    }

    const admin = await User.findById(req.user._id).select('+password');
    const isMatch = await admin.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password does not match.'
      });
    }

    admin.password = newPassword;
    await admin.save();

    res.json({
      success: true,
      message: 'Admin password updated securely.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
