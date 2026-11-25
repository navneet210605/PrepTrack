const PrepItem = require('../models/PrepItem');

/**
 * Spaced Repetition Intervals (in days)
 * Demonstrates intelligent spaced learning algorithms using MongoDB atomic date updates
 */
const REVISION_GAPS_DAYS = [1, 3, 7, 15, 30];

/**
 * @desc    Create a new prep item
 * @route   POST /api/prep
 * @access  Private
 * MongoDB Feature Demonstrated: Document Creation with User ID reference scoping
 */
exports.createPrepItem = async (req, res, next) => {
  try {
    const { category, title, topic, difficulty, status, link, notes, nextRevisionDate } = req.body;

    const prepItem = await PrepItem.create({
      userId: req.user._id,
      category,
      title,
      topic,
      difficulty,
      status: status || 'Todo',
      link,
      notes,
      nextRevisionDate: nextRevisionDate || null
    });

    res.status(201).json({
      success: true,
      data: prepItem
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get prep items with category/status filters, text search, pagination
 * @route   GET /api/prep
 * @access  Private
 * MongoDB Feature Demonstrated:
 * 1. Filter queries (exact match on category, status, userId)
 * 2. $text index full-text search with score projection
 * 3. Cursor Pagination (.skip(), .limit())
 * 4. Document count via countDocuments()
 */
exports.getPrepItems = async (req, res, next) => {
  try {
    const { category, status, q, page = 1, limit = 10 } = req.query;

    const query = { userId: req.user._id };

    if (category && category !== 'All') query.category = category;
    if (status && status !== 'All') query.status = status;

    let scoreProjection = {};
    let sortOption = { createdAt: -1 };

    // MongoDB Feature Demonstrated: Full-Text search query ($text)
    if (q && q.trim()) {
      query.$text = { $search: q.trim() };
      scoreProjection = { score: { $meta: 'textScore' } };
      sortOption = { score: { $meta: 'textScore' } };
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (pageNum - 1) * limitNum;

    // Static default values for new accounts or empty lists
    let total = await PrepItem.countDocuments(query);
    if (total === 0 && (!category || category === 'All') && (!status || status === 'All') && !q && pageNum === 1) {
      const now = Date.now();
      const day = 24 * 60 * 60 * 1000;
      const staticPrep = [
        {
          userId: req.user._id,
          category: 'DSA',
          title: 'Floyd Cycle Detection & Starting Point',
          topic: 'Linked Lists',
          difficulty: 'Medium',
          status: 'Done',
          link: 'https://leetcode.com/problems/linked-list-cycle-ii/',
          notes: 'Slow pointer 1 step, fast pointer 2 steps. When they meet, reset slow to head and advance both 1 step to find cycle start.',
          nextRevisionDate: new Date(now - 2 * 60 * 60 * 1000), // Due today
          revisionCount: 2
        },
        {
          userId: req.user._id,
          category: 'CS Core',
          title: 'Virtual Memory, TLB and Page Replacement (LRU)',
          topic: 'Operating Systems',
          difficulty: 'Hard',
          status: 'Done',
          link: 'https://www.geeksforgeeks.org/virtual-memory-in-operating-system/',
          notes: 'Page hit vs miss. TLB acts as hardware cache for page table entries. Belady anomaly in FIFO.',
          nextRevisionDate: new Date(now - 5 * 60 * 1000), // Due today
          revisionCount: 1
        },
        {
          userId: req.user._id,
          category: 'Development',
          title: 'MongoDB Aggregation Pipeline Optimization',
          topic: 'MongoDB',
          difficulty: 'Medium',
          status: 'Todo',
          link: 'https://www.mongodb.com/docs/manual/core/aggregation-pipeline-optimization/',
          notes: 'Always place $match and $project early in pipeline to utilize indexes and trim BSON document stream.',
          nextRevisionDate: null,
          revisionCount: 0
        },
        {
          userId: req.user._id,
          category: 'Aptitude',
          title: 'Time & Work - Work Equivalence and Pipes',
          topic: 'Quantitative Aptitude',
          difficulty: 'Easy',
          status: 'Revise',
          link: '',
          notes: 'Total work as LCM of individual times. Efficiency ratio = inverse of time taken.',
          nextRevisionDate: new Date(now + 2 * day),
          revisionCount: 1
        },
        {
          userId: req.user._id,
          category: 'HR',
          title: 'STAR Method: Handling Technical Disagreements',
          topic: 'Behavioral Interviews',
          difficulty: 'Medium',
          status: 'Todo',
          link: '',
          notes: 'Situation, Task, Action taken with empathy and metrics, Result achieved.',
          nextRevisionDate: null,
          revisionCount: 0
        },
        {
          userId: req.user._id,
          category: 'Projects & Resume',
          title: 'System Design Architecture for PrepTrack',
          topic: 'System Architecture',
          difficulty: 'Hard',
          status: 'Done',
          link: 'https://github.com/',
          notes: 'Documented Mongoose schema validation, compound indexes, and microservice data flow.',
          nextRevisionDate: new Date(now + 4 * day),
          revisionCount: 3
        }
      ];
      await PrepItem.insertMany(staticPrep);
      total = staticPrep.length;
    }

    const items = await PrepItem.find(query, scoreProjection)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      limit: limitNum,
      data: items
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get prep items scheduled for revision today or overdue
 * @route   GET /api/prep/revise-today
 * @access  Private
 * MongoDB Feature Demonstrated: Date comparison using $lte operator (nextRevisionDate <= now)
 * Utilizing compound index (userId, nextRevisionDate)
 */
exports.getReviseToday = async (req, res, next) => {
  try {
    const now = new Date();

    // MongoDB Feature Demonstrated: Date Range Comparison Query ($lte)
    const items = await PrepItem.find({
      userId: req.user._id,
      nextRevisionDate: { $lte: now }
    }).sort({ nextRevisionDate: 1 });

    res.status(200).json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark a prep item as revised (spaced repetition update)
 * @route   PUT /api/prep/:id/revised
 * @access  Private
 * MongoDB Feature Demonstrated: Atomic Update Operators:
 * 1. $inc: Increments revisionCount by 1
 * 2. $set: Sets the newly calculated nextRevisionDate and status to 'Done'
 */
exports.markRevised = async (req, res, next) => {
  try {
    const item = await PrepItem.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Prep item not found'
      });
    }

    const currentCount = item.revisionCount || 0;
    const gapDays = REVISION_GAPS_DAYS[Math.min(currentCount, REVISION_GAPS_DAYS.length - 1)];
    const nextRevisionDate = new Date(Date.now() + gapDays * 24 * 60 * 60 * 1000);

    // MongoDB Feature Demonstrated: findOneAndUpdate with atomic $inc and $set operators
    const updated = await PrepItem.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      {
        $inc: { revisionCount: 1 },
        $set: {
          nextRevisionDate,
          status: 'Done'
        }
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updated,
      message: `Item revised! Next revision in ${gapDays} day${gapDays > 1 ? 's' : ''}.`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single prep item by ID
 * @route   GET /api/prep/:id
 * @access  Private
 * MongoDB Feature Demonstrated: Scoped Document Read (userId + _id)
 */
exports.getPrepItemById = async (req, res, next) => {
  try {
    const item = await PrepItem.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Prep item not found'
      });
    }

    res.status(200).json({
      success: true,
      data: item
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update prep item
 * @route   PUT /api/prep/:id
 * @access  Private
 * MongoDB Feature Demonstrated: Document Update with Validators (runValidators: true)
 */
exports.updatePrepItem = async (req, res, next) => {
  try {
    const updated = await PrepItem.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Prep item not found'
      });
    }

    res.status(200).json({
      success: true,
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete prep item
 * @route   DELETE /api/prep/:id
 * @access  Private
 * MongoDB Feature Demonstrated: Scoped Document Deletion (findOneAndDelete)
 */
exports.deletePrepItem = async (req, res, next) => {
  try {
    const deleted = await PrepItem.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Prep item not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Prep item removed successfully'
    });
  } catch (error) {
    next(error);
  }
};
