const Application = require('../models/Application');

/**
 * @desc    Create a new job application
 * @route   POST /api/applications
 * @access  Private
 * MongoDB Feature Demonstrated: Document Creation with user referencing
 */
exports.createApplication = async (req, res, next) => {
  try {
    const { company, role, status, deadline, appliedDate, notes } = req.body;

    const application = await Application.create({
      userId: req.user._id,
      company,
      role,
      status: status || 'Applied',
      deadline: deadline || null,
      appliedDate: appliedDate || Date.now(),
      notes: notes || ''
    });

    res.status(201).json({
      success: true,
      data: application
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get job applications with status filter, pagination, sorted by deadline
 * @route   GET /api/applications
 * @access  Private
 * MongoDB Feature Demonstrated: Compound Index Query, Cursor Pagination, and Sorting by Date
 */
exports.getApplications = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10, sort = 'deadline' } = req.query;

    const query = { userId: req.user._id };
    if (status && status !== 'All') {
      query.status = status;
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (pageNum - 1) * limitNum;

    // Static default values for new accounts or empty lists
    let total = await Application.countDocuments(query);
    if (total === 0 && (!status || status === 'All') && pageNum === 1) {
      const now = Date.now();
      const day = 24 * 60 * 60 * 1000;
      const staticApps = [
        {
          userId: req.user._id,
          company: 'Google',
          role: 'Software Engineer - University Graduate',
          status: 'Interview',
          deadline: new Date(now + 2 * day),
          appliedDate: new Date(now - 14 * day),
          notes: 'Round 2 DSA technical interview scheduled on Google Meet. Focus on Graphs & BST.'
        },
        {
          userId: req.user._id,
          company: 'Microsoft',
          role: 'SDE 1 (Azure Cloud)',
          status: 'Test',
          deadline: new Date(now + 5 * day),
          appliedDate: new Date(now - 7 * day),
          notes: 'Codility online assessment link received. 3 algorithmic coding challenges.'
        },
        {
          userId: req.user._id,
          company: 'Amazon',
          role: 'Software Development Engineer Intern',
          status: 'Applied',
          deadline: new Date(now + 12 * day),
          appliedDate: new Date(now - 3 * day),
          notes: 'Applied via employee referral on Amazon Jobs portal.'
        },
        {
          userId: req.user._id,
          company: 'Atlassian',
          role: 'Associate Software Engineer',
          status: 'Offer',
          deadline: null,
          appliedDate: new Date(now - 30 * day),
          notes: 'Official Offer letter received! Base: 18 LPA + Equity.'
        },
        {
          userId: req.user._id,
          company: 'Uber',
          role: 'Frontend Engineer (React)',
          status: 'Rejected',
          deadline: null,
          appliedDate: new Date(now - 25 * day),
          notes: 'Position closed after university hiring batch reached capacity.'
        }
      ];
      await Application.insertMany(staticApps);
      total = staticApps.length;
    }

    // Sort order: closest upcoming deadline first, null deadlines at the end
    let sortObj = { deadline: 1, createdAt: -1 };
    if (sort === '-appliedDate') {
      sortObj = { appliedDate: -1 };
    }

    const applications = await Application.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      limit: limitNum,
      data: applications
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single application by ID
 * @route   GET /api/applications/:id
 * @access  Private
 * MongoDB Feature Demonstrated: Scoped Document Read (userId + _id)
 */
exports.getApplicationById = async (req, res, next) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.status(200).json({
      success: true,
      data: application
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update application (e.g. status transition Applied -> Test -> Interview)
 * @route   PUT /api/applications/:id
 * @access  Private
 * MongoDB Feature Demonstrated: Document Update with Validators
 */
exports.updateApplication = async (req, res, next) => {
  try {
    const application = await Application.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.status(200).json({
      success: true,
      data: application
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete application
 * @route   DELETE /api/applications/:id
 * @access  Private
 * MongoDB Feature Demonstrated: Scoped Document Deletion (findOneAndDelete)
 */
exports.deleteApplication = async (req, res, next) => {
  try {
    const application = await Application.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Application removed successfully'
    });
  } catch (error) {
    next(error);
  }
};
