const mongoose = require('mongoose');
const TestAttempt = require('../models/TestAttempt');
const Application = require('../models/Application');
const PrepItem = require('../models/PrepItem');
const User = require('../models/User');

/**
 * @desc    Accuracy by Question Category
 * @route   GET /api/stats/accuracy-by-category
 * @access  Private
 * MongoDB Feature Demonstrated: Multi-stage Aggregation Pipeline
 * ($match -> $unwind -> $lookup -> $unwind -> $group -> $project -> $sort)
 */
exports.getAccuracyByCategory = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);

    const stats = await TestAttempt.aggregate([
      // Stage 1: $match - Filter attempts belonging to this user
      { $match: { userId } },

      // Stage 2: $unwind - Deconstruct embedded answers array into individual stream documents
      { $unwind: '$answers' },

      // Stage 3: $lookup - Left outer join to Question collection
      {
        $lookup: {
          from: 'questions',
          localField: 'answers.questionId',
          foreignField: '_id',
          as: 'question'
        }
      },

      // Stage 4: $unwind - Flatten the joined question document array
      { $unwind: '$question' },

      // Stage 5: $group - Group by question category and accumulate sums
      {
        $group: {
          _id: '$question.category',
          total: { $sum: 1 },
          correct: {
            $sum: {
              $cond: [{ $eq: ['$answers.isCorrect', true] }, 1, 0]
            }
          }
        }
      },

      // Stage 6: $project - Reshape fields and calculate accuracy percentage
      {
        $project: {
          _id: 0,
          category: '$_id',
          total: 1,
          correct: 1,
          accuracy: {
            $cond: [
              { $gt: ['$total', 0] },
              { $round: [{ $multiply: [{ $divide: ['$correct', '$total'] }, 100] }, 1] },
              0
            ]
          }
        }
      },

      // Stage 7: $sort - Sort alphabetically by category
      { $sort: { category: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Weak Topics Analysis (accuracy < 60%, worst first, top 5)
 * @route   GET /api/stats/weak-topics
 * @access  Private
 * MongoDB Feature Demonstrated: Aggregation with $lookup, $group, $match (having condition), $sort, and $limit
 */
exports.getWeakTopics = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);

    const weakTopics = await TestAttempt.aggregate([
      // Stage 1: $match - User scoping
      { $match: { userId } },

      // Stage 2: $unwind - Unwind answer subdocuments
      { $unwind: '$answers' },

      // Stage 3: $lookup - Join with questions collection
      {
        $lookup: {
          from: 'questions',
          localField: 'answers.questionId',
          foreignField: '_id',
          as: 'question'
        }
      },

      // Stage 4: $unwind - Flatten question array
      { $unwind: '$question' },

      // Stage 5: $group - Group by specific topic
      {
        $group: {
          _id: '$question.topic',
          category: { $first: '$question.category' },
          total: { $sum: 1 },
          correct: {
            $sum: {
              $cond: [{ $eq: ['$answers.isCorrect', true] }, 1, 0]
            }
          }
        }
      },

      // Stage 6: $project - Calculate accuracy
      {
        $project: {
          _id: 0,
          topic: '$_id',
          category: 1,
          total: 1,
          correct: 1,
          accuracy: {
            $cond: [
              { $gt: ['$total', 0] },
              { $round: [{ $multiply: [{ $divide: ['$correct', '$total'] }, 100] }, 1] },
              0
            ]
          }
        }
      },

      // Stage 7: $match - Post-aggregation filter for topics with accuracy < 60%
      { $match: { accuracy: { $lt: 60 } } },

      // Stage 8: $sort - Sort ascending (weakest performance first)
      { $sort: { accuracy: 1 } },

      // Stage 9: $limit - Return top 5 weakest areas
      { $limit: 5 }
    ]);

    res.status(200).json({
      success: true,
      data: weakTopics
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Score Trend for recent test attempts
 * @route   GET /api/stats/score-trend
 * @access  Private
 * MongoDB Feature Demonstrated: Aggregation with $sort, $limit, and $dateToString operator
 */
exports.getScoreTrend = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);

    const trend = await TestAttempt.aggregate([
      // Stage 1: $match user attempts
      { $match: { userId } },

      // Stage 2: $sort descending to get newest 10
      { $sort: { createdAt: -1 } },

      // Stage 3: $limit to 10 attempts
      { $limit: 10 },

      // Stage 4: $sort ascending so line chart progresses chronologically left-to-right
      { $sort: { createdAt: 1 } },

      // Stage 5: $project with $dateToString format
      {
        $project: {
          _id: 1,
          date: {
            $dateToString: {
              format: '%b %d, %H:%M',
              date: '$createdAt'
            }
          },
          category: 1,
          topic: 1,
          score: 1,
          total: 1,
          accuracy: {
            $cond: [
              { $gt: ['$total', 0] },
              { $round: [{ $multiply: [{ $divide: ['$score', '$total'] }, 100] }, 1] },
              0
            ]
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: trend
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Applications status funnel breakdown
 * @route   GET /api/stats/applications-funnel
 * @access  Private
 * MongoDB Feature Demonstrated: Aggregation $group by categorical status
 */
exports.getApplicationsFunnel = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);

    const funnel = await Application.aggregate([
      // Stage 1: $match user's applications
      { $match: { userId } },

      // Stage 2: $group by application status
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },

      // Stage 3: $project formatted output
      {
        $project: {
          _id: 0,
          status: '$_id',
          count: 1
        }
      }
    ]);

    // Ensure all standard stages are present for UI even if count is 0
    const stages = ['Applied', 'Test', 'Interview', 'Offer', 'Rejected'];
    const funnelMap = new Map(funnel.map((f) => [f.status, f.count]));
    const formattedFunnel = stages.map((st) => ({
      status: st,
      count: funnelMap.get(st) || 0
    }));

    res.status(200).json({
      success: true,
      data: formattedFunnel
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Dashboard Plan: Summary action plan for today
 * @route   GET /api/dashboard/plan
 * @access  Private
 * MongoDB Feature Demonstrated:
 * 1. countDocuments with $lte date filter for revision count
 * 2. Aggregation pipeline ($match, $lookup, $group, $sort, $limit: 1) for weakest topic
 * 3. Range query ($gte, $lte) with sorting for upcoming deadlines
 */
exports.getDashboardPlan = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const now = new Date();
    const threeDaysFromNow = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

    // 1. Revisions due today or overdue
    const reviseCountPromise = PrepItem.countDocuments({
      userId: req.user._id,
      nextRevisionDate: { $lte: now }
    });

    // 2. Identify weakest topic
    const weakestTopicPromise = TestAttempt.aggregate([
      { $match: { userId } },
      { $unwind: '$answers' },
      {
        $lookup: {
          from: 'questions',
          localField: 'answers.questionId',
          foreignField: '_id',
          as: 'question'
        }
      },
      { $unwind: '$question' },
      {
        $group: {
          _id: '$question.topic',
          category: { $first: '$question.category' },
          total: { $sum: 1 },
          correct: {
            $sum: {
              $cond: [{ $eq: ['$answers.isCorrect', true] }, 1, 0]
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          topic: '$_id',
          category: 1,
          total: 1,
          accuracy: {
            $cond: [
              { $gt: ['$total', 0] },
              { $round: [{ $multiply: [{ $divide: ['$correct', '$total'] }, 100] }, 1] },
              0
            ]
          }
        }
      },
      { $match: { accuracy: { $lt: 75 } } },
      { $sort: { accuracy: 1 } },
      { $limit: 1 }
    ]);

    // 3. Upcoming deadlines in next 3 days
    const upcomingDeadlinesPromise = Application.find({
      userId: req.user._id,
      deadline: { $gte: now, $lte: threeDaysFromNow }
    })
      .sort({ deadline: 1 })
      .limit(3);

    // 4. Fetch latest user streak info
    const userPromise = User.findById(req.user._id).select('streak');

    const [reviseCount, weakestTopicArr, upcomingDeadlines, user] = await Promise.all([
      reviseCountPromise,
      weakestTopicPromise,
      upcomingDeadlinesPromise,
      userPromise
    ]);

    res.status(200).json({
      success: true,
      data: {
        reviseCount,
        weakestTopic: weakestTopicArr.length > 0 ? weakestTopicArr[0] : null,
        upcomingDeadlines,
        streak: user ? user.streak : { current: 0 }
      }
    });
  } catch (error) {
    next(error);
  }
};
