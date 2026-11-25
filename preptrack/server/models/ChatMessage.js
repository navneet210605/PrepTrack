const mongoose = require('mongoose');

/**
 * MongoDB Feature Demonstrated: Document Referencing, Enum Validation,
 * Compound Index with Chronological Sort (userId, createdAt: 1), and Text Indexing.
 */
const chatMessageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    topic: {
      type: String,
      default: 'General'
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
 * MongoDB Feature Demonstrated: Compound Index
 * Optimizes fetching chronological conversation history for a specific user.
 */
chatMessageSchema.index({ userId: 1, createdAt: 1 });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
