const Question = require('../models/Question');

/**
 * @desc    Get questions with filters, $text full-text search, pagination, and sorting
 * @route   GET /api/questions
 * @access  Private
 * MongoDB Feature Demonstrated:
 * 1. Filter queries (exact match on category, topic, difficulty)
 * 2. $text full-text search with textScore ranking
 * 3. Cursor Pagination using .skip() and .limit()
 * 4. Document count via countDocuments()
 * 5. Dynamic sorting (.sort())
 */
exports.getQuestions = async (req, res, next) => {
  try {
    const { category, topic, difficulty, q, page = 1, limit = 10, sort = '-createdAt' } = req.query;

    const query = {};

    // Exact match filters (MongoDB Feature: Field Querying)
    if (category) query.category = category;
    if (topic) query.topic = topic;
    if (difficulty) query.difficulty = difficulty;

    // MongoDB Feature Demonstrated: Full-Text Search ($text operator)
    let scoreProjection = {};
    let sortOption = sort;

    if (q && q.trim()) {
      query.$text = { $search: q.trim() };
      scoreProjection = { score: { $meta: 'textScore' } };
      // Sort by relevance score when text search is active
      sortOption = { score: { $meta: 'textScore' } };
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (pageNum - 1) * limitNum;

    // MongoDB Feature: Parallel execution for pagination count and data retrieval
    const [total, questions] = await Promise.all([
      Question.countDocuments(query),
      Question.find(query, scoreProjection)
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
    ]);

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      limit: limitNum,
      count: questions.length,
      data: questions
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single question by ID
 * @route   GET /api/questions/:id
 * @access  Private
 * MongoDB Feature Demonstrated: Primary Key Lookup (Question.findById)
 */
exports.getQuestionById = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }
    res.status(200).json({
      success: true,
      data: question
    });
  } catch (error) {
    next(error);
  }
};
