const express = require('express');
const router = express.Router();
const {
  getAccuracyByCategory,
  getWeakTopics,
  getScoreTrend,
  getApplicationsFunnel,
  getDashboardPlan
} = require('../controllers/statsController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/accuracy-by-category', getAccuracyByCategory);
router.get('/weak-topics', getWeakTopics);
router.get('/score-trend', getScoreTrend);
router.get('/applications-funnel', getApplicationsFunnel);
router.get('/plan', getDashboardPlan); // can also be hit at /api/stats/plan

module.exports = router;
