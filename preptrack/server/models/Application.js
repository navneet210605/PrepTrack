const mongoose = require('mongoose');

/**
 * MongoDB Feature Demonstrated: Document Referencing, Enums, Default Values,
 * Date handling, and Compound Indexes for fast filtering and deadline alert queries.
 */
const applicationSchema = new mongoose.Schema(
  {
    // MongoDB Feature: Reference to User document
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true
    },
    role: {
      type: String,
      required: [true, 'Job role is required'],
      trim: true
    },
    status: {
      type: String,
      enum: {
        values: ['Applied', 'Test', 'Interview', 'Offer', 'Rejected'],
        message: '{VALUE} is not a valid application status'
      },
      default: 'Applied'
    },
    deadline: {
      type: Date
    },
    appliedDate: {
      type: Date,
      default: Date.now
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

/**
 * MongoDB Feature Demonstrated: Compound Indexes
 * 1. (userId, status): Accelerates application funnel aggregation and status filter queries.
 * 2. (userId, deadline): Accelerates upcoming deadline alerts for the 3-day dashboard window.
 */
applicationSchema.index({ userId: 1, status: 1 });
applicationSchema.index({ userId: 1, deadline: 1 });

module.exports = mongoose.model('Application', applicationSchema);
