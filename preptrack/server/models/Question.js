const mongoose = require('mongoose');

/**
 * MongoDB Feature Demonstrated: Embedded Array of Strings, Enum Validation,
 * Range Constraints (min/max), Default Values, Compound Index, and Text Index.
 */
const questionSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: [true, 'Category is required'],
      // MongoDB Feature: String Enum validation
      enum: {
        values: ['DSA', 'Aptitude', 'CS Core', 'Development'],
        message: '{VALUE} is not a valid question category'
      }
    },
    topic: {
      type: String,
      required: [true, 'Topic is required'],
      trim: true
    },
    difficulty: {
      type: String,
      required: [true, 'Difficulty is required'],
      enum: {
        values: ['Easy', 'Medium', 'Hard'],
        message: '{VALUE} is not a valid difficulty level'
      }
    },
    text: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true
    },
    // MongoDB Feature: Embedded Array of primitive strings with custom length validation
    options: {
      type: [String],
      required: true,
      validate: {
        validator: function (val) {
          return Array.isArray(val) && val.length === 4;
        },
        message: 'A question must contain exactly 4 options'
      }
    },
    correctIndex: {
      type: Number,
      required: [true, 'Correct option index is required'],
      min: [0, 'Option index must be between 0 and 3'],
      max: [3, 'Option index must be between 0 and 3']
    },
    explanation: {
      type: String,
      required: [true, 'Explanation is required for learning review'],
      trim: true
    },
    source: {
      type: String,
      default: 'PYQ',
      trim: true
    }
  },
  {
    timestamps: true
  }
);

/**
 * MongoDB Feature Demonstrated: Compound Index
 * Optimizes queries filtering by category, topic, and difficulty simultaneously (e.g. test generation).
 */
questionSchema.index({ category: 1, topic: 1, difficulty: 1 });

/**
 * MongoDB Feature Demonstrated: Full-Text Index ($text)
 * Creates inverted indexes over 'text' and 'topic' fields to support high-speed keyword search.
 */
questionSchema.index({ text: 'text', topic: 'text' });

module.exports = mongoose.model('Question', questionSchema);
