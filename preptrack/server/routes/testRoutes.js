const express = require('express');
const router = express.Router();
const {
  startTest,
  submitTest,
  getTestHistory,
  getTestAttemptById
} = require('../controllers/testController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/start', startTest);
router.post('/submit', submitTest);
router.get('/history', getTestHistory);
router.get('/:id', getTestAttemptById);

module.exports = router;
