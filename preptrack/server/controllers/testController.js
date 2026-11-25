const mongoose = require('mongoose');
const Question = require('../models/Question');
const TestAttempt = require('../models/TestAttempt');
const User = require('../models/User');

/**
 * @desc    Start a new test session with randomly sampled questions
 * @route   POST /api/tests/start
 * @access  Private
 * MongoDB Feature Demonstrated: Aggregation Framework ($match, $sample, $project)
 * 1. $match: Filters candidates by category and optional topic/difficulty
 * 2. $sample: Randomly selects N documents (native pseudo-random sampling in MongoDB)
 * 3. $project: Projection exclusion ({ correctIndex: 0, explanation: 0 }) to hide answer key from client
 */
exports.startTest = async (req, res, next) => {
  try {
    const { category, topic, difficulty, count = 10 } = req.body;

    const matchConditions = {};
    if (category) matchConditions.category = category;
    if (topic && topic !== 'All') matchConditions.topic = topic;
    if (difficulty && difficulty !== 'All' && difficulty !== 'Mixed') matchConditions.difficulty = difficulty;

    const sampleSize = Math.max(1, Math.min(50, parseInt(count, 10) || 10));

    // MongoDB Feature Demonstrated: Multi-stage Aggregation Pipeline
    const questions = await Question.aggregate([
      // Stage 1: $match - Filter candidate pool
      { $match: matchConditions },
      // Stage 2: $sample - Efficient random document selection
      { $sample: { size: sampleSize } },
      // Stage 3: $project - Security projection: exclude correct answer and explanation
      {
        $project: {
          category: 1,
          topic: 1,
          difficulty: 1,
          text: 1,
          options: 1,
          source: 1,
          createdAt: 1
        }
      }
    ]);

    if (!questions || questions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No questions found matching the selected criteria'
      });
    }

    res.status(200).json({
      success: true,
      count: questions.length,
      data: questions
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit test answers, grade on server, save attempt, update user streak
 * @route   POST /api/tests/submit
 * @access  Private
 * MongoDB Feature Demonstrated:
 * 1. $in operator batch fetch (Question.find({ _id: { $in: ... } }))
 * 2. Document Creation with embedded array of subdocuments
 * 3. Atomic Update Operators: $inc (increment streak) and $set (reset/update streak & timestamp)
 */
exports.submitTest = async (req, res, next) => {
  try {
    const { questionIds = [], answers = [], timeTakenSec = 0, category, topic, difficulty } = req.body;

    if (!questionIds || questionIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Question IDs are required for submission'
      });
    }

    // Convert to valid Mongo ObjectIds
    const validObjectIds = questionIds
      .filter((id) => mongoose.Types.ObjectId.isValid(id))
      .map((id) => new mongoose.Types.ObjectId(id));

    // MongoDB Feature: Batch Query with $in operator
    const questions = await Question.find({ _id: { $in: validObjectIds } });

    if (questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Questions could not be found'
      });
    }

    // Map questions by id for fast O(1) grading
    const questionMap = new Map();
    questions.forEach((q) => questionMap.set(q._id.toString(), q));

    let score = 0;
    const gradedAnswers = [];
    const questionDetails = [];

    // Grade each question on the server to prevent client cheating
    for (const q of questions) {
      const qIdStr = q._id.toString();
      const userSubmission = answers.find(
        (a) => (a.questionId ? a.questionId.toString() : a._id ? a._id.toString() : '') === qIdStr
      );

      const selectedIndex =
        userSubmission !== undefined && userSubmission.selectedIndex !== undefined
          ? Number(userSubmission.selectedIndex)
          : -1;

      const isCorrect = selectedIndex === q.correctIndex;
      if (isCorrect) score += 1;

      gradedAnswers.push({
        questionId: q._id,
        selectedIndex,
        isCorrect
      });

      questionDetails.push({
        questionId: q._id,
        text: q.text,
        options: q.options,
        selectedIndex,
        correctIndex: q.correctIndex,
        isCorrect,
        explanation: q.explanation,
        category: q.category,
        topic: q.topic,
        difficulty: q.difficulty
      });
    }

    const testCategory = category || (questions[0] ? questions[0].category : 'Mixed');
    const testTopic = topic || 'Mixed';
    const testDifficulty = difficulty || 'Mixed';

    // MongoDB Feature: Create TestAttempt with embedded array
    const attempt = await TestAttempt.create({
      userId: req.user._id,
      category: testCategory,
      topic: testTopic,
      difficulty: testDifficulty,
      answers: gradedAnswers,
      score,
      total: questions.length,
      timeTakenSec
    });

    // --- Streak Logic with MongoDB Update Operators ($inc, $set) ---
    const user = await User.findById(req.user._id);
    const now = new Date();
    const todayDateStr = now.toISOString().slice(0, 10); // YYYY-MM-DD

    let streakUpdate = {};
    if (!user.streak || !user.streak.lastActiveDate) {
      // First activity: initialize streak to 1
      streakUpdate = {
        $set: {
          'streak.current': 1,
          'streak.lastActiveDate': now
        }
      };
    } else {
      const lastActiveDateStr = new Date(user.streak.lastActiveDate).toISOString().slice(0, 10);
      const diffDays = Math.round(
        (new Date(todayDateStr) - new Date(lastActiveDateStr)) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === 0) {
        // Already active today: keep current streak, update timestamp
        streakUpdate = {
          $set: { 'streak.lastActiveDate': now }
        };
      } else if (diffDays === 1) {
        // Consecutive day: MongoDB $inc operator increments streak count by 1
        streakUpdate = {
          $inc: { 'streak.current': 1 },
          $set: { 'streak.lastActiveDate': now }
        };
      } else {
        // Streak broken: MongoDB $set operator resets streak to 1
        streakUpdate = {
          $set: {
            'streak.current': 1,
            'streak.lastActiveDate': now
          }
        };
      }
    }

    // MongoDB Feature: findByIdAndUpdate with update operators and return updated doc ({ new: true })
    const updatedUser = await User.findByIdAndUpdate(req.user._id, streakUpdate, { new: true });

    res.status(201).json({
      success: true,
      data: {
        attemptId: attempt._id,
        score,
        total: questions.length,
        accuracy: attempt.accuracy, // Calculated via Mongoose virtual
        timeTakenSec,
        streak: updatedUser ? updatedUser.streak : { current: 1 },
        results: questionDetails
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get paginated test history for current user
 * @route   GET /api/tests/history
 * @access  Private
 * MongoDB Feature Demonstrated: Compound Index lookup, Cursor Pagination (.skip(), .limit()),
 * and Sorting (.sort({ createdAt: -1 }))
 */
exports.getTestHistory = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 10);
    const skip = (page - 1) * limit;

    const query = { userId: req.user._id };

    const [total, attempts] = await Promise.all([
      TestAttempt.countDocuments(query),
      TestAttempt.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
    ]);

    res.status(200).json({
      success: true,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      limit,
      data: attempts
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single test attempt by ID with populated questions
 * @route   GET /api/tests/:id
 * @access  Private
 * MongoDB Feature Demonstrated: Referencing and Population (.populate('answers.questionId'))
 * Resolves full question details from the referenced Question collection
 */
exports.getTestAttemptById = async (req, res, next) => {
  try {
    const attempt = await TestAttempt.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate({
      path: 'answers.questionId',
      select: 'text options correctIndex explanation category topic difficulty'
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Test attempt not found'
      });
    }

    res.status(200).json({
      success: true,
      data: attempt
    });
  } catch (error) {
    next(error);
  }
};
