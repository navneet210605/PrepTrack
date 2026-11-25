const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * MongoDB Feature Demonstrated: Schema Validation, Unique Index, Field Projection (select: false),
 * Embedded Object (streak), and Document Middleware (pre-save hook for password hashing).
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true, // MongoDB Feature: Unique Index ensures no duplicate user accounts
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address'
      ]
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false // MongoDB Feature: Projection safeguard (excluded from query results by default)
    },
    streak: {
      // MongoDB Feature: Embedded Subdocument for user activity tracking
      current: {
        type: Number,
        default: 0,
        min: 0
      },
      lastActiveDate: {
        type: Date
      }
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

/**
 * MongoDB Feature Demonstrated: Mongoose Document Middleware (pre-save hook)
 * Automatically hashes the password using bcrypt before persisting the document to MongoDB.
 */
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/**
 * MongoDB Feature Demonstrated: Mongoose Schema Instance Method
 * Compares incoming plain-text password with stored bcrypt hash.
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
