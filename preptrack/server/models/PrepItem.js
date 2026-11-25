const mongoose = require('mongoose');

/**
 * MongoDB Feature Demonstrated: Schema Validation, Enums, Default Values,
 * Document Referencing, Compound Indexes, Full-Text Search Index, and Document Pre-Save Middleware.
 */
const prepItemSchema = new mongoose.Schema(
  {
    // MongoDB Feature: Reference to User document (Multi-tenant scoping)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ['DSA', 'Aptitude', 'CS Core', 'Development', 'HR', 'Projects & Resume'],
        message: '{VALUE} is not a valid prep category'
      }
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true
    },
    topic: {
      type: String,
      required: [true, 'Topic is required'],
      trim: true
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium'
    },
    status: {
      type: String,
      enum: {
        values: ['Todo', 'Done', 'Revise'],
        message: '{VALUE} is not a valid status'
      },
      default: 'Todo'
    },
    link: {
      type: String,
      trim: true,
      default: ''
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    },
    nextRevisionDate: {
      type: Date
    },
    revisionCount: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  {
    timestamps: true
  }
);

/**
 * MongoDB Feature Demonstrated: Compound Indexes
 * 1. (userId, nextRevisionDate): High performance query for "Revise Today" items due now.
 * 2. (userId, status): High performance filter for items by status tab (Todo / Done / Revise).
 */
prepItemSchema.index({ userId: 1, nextRevisionDate: 1 });
prepItemSchema.index({ userId: 1, status: 1 });

/**
 * MongoDB Feature Demonstrated: Text Index on multiple fields ($text search)
 * Supports full-text search across topic notes and problem titles.
 */
prepItemSchema.index({ title: 'text', notes: 'text' });

/**
 * MongoDB Feature Demonstrated: Mongoose pre('save') Middleware Hook
 * Business Logic: When a prep topic is marked as 'Done', automatically schedule
 * its first spaced repetition revision (+24 hours) if no date was explicitly set.
 */
prepItemSchema.pre('save', function (next) {
  if (this.status === 'Done' && !this.nextRevisionDate) {
    // Schedule first spaced repetition revision 1 day (24 hours) from now
    this.nextRevisionDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
  }
  next();
});

module.exports = mongoose.model('PrepItem', prepItemSchema);
