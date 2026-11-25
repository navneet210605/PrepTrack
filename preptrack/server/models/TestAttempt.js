const mongoose = require('mongoose');

/**
 * MongoDB Feature Demonstrated: Document Referencing (ObjectId ref),
 * Embedded Subdocument Arrays (answers), Compound Sorting Index, and Mongoose Virtuals.
 */
const answerItemSchema = new mongoose.Schema(
  {
    // MongoDB Feature: Foreign Key Reference to Question model
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true
    },
    selectedIndex: {
      type: Number,
      default: -1 // -1 means skipped/unanswered
    },
    isCorrect: {
      type: Boolean,
      required: true
    }
  },
  { _id: false }
);

const testAttemptSchema = new mongoose.Schema(
  {
    // MongoDB Feature: Document Reference to User model
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true
    },
    category: {
      type: String,
      required: true
    },
    topic: {
      type: String,
      default: 'Mixed'
    },
    difficulty: {
      type: String,
      default: 'Mixed'
    },
    // MongoDB Feature: Embedded Array of Subdocuments (1-to-many relationship embedded)
    answers: [answerItemSchema],
    score: {
      type: Number,
      required: true,
      min: 0
    },
    total: {
      type: Number,
      required: true,
      min: 1
    },
    timeTakenSec: {
      type: Number,
      default: 0
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

/**
 * MongoDB Feature Demonstrated: Compound Index with Directional Sort (-1 for descending date)
 * Optimizes test history retrieval for a specific user ordered chronologically.
 */
testAttemptSchema.index({ userId: 1, createdAt: -1 });

/**
 * MongoDB Feature Demonstrated: Mongoose Virtual Field
 * Calculates dynamic field 'accuracy' percentage on the fly without storing redundant data in the MongoDB document.
 */
testAttemptSchema.virtual('accuracy').get(function () {
  if (!this.total || this.total === 0) return 0;
  return Math.round((this.score / this.total) * 100);
});

module.exports = mongoose.model('TestAttempt', testAttemptSchema);
