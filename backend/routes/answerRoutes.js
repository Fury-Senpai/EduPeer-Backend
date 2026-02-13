const express = require('express');

const {
  getAnswersByQuestion,
  createAnswer,
  upvoteAnswer,
} = require('../controllers/answerController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/question/:questionId', getAnswersByQuestion);
router.post('/:questionId', authMiddleware, createAnswer);
router.put('/upvote/:id', authMiddleware, upvoteAnswer);
router.post('/:id/upvote', authMiddleware, upvoteAnswer);

module.exports = router;
