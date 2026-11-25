const express = require('express');
const router = express.Router();
const { getQuestions, getQuestionById } = require('../controllers/questionController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getQuestions);
router.get('/:id', getQuestionById);

module.exports = router;
