const express = require('express');

const {
  getAnswersByQuestion,
  createAnswer,
  upvoteAnswer,
  acceptAnswer,
} = require('../controllers/answerController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/question/:questionId', getAnswersByQuestion);
router.post('/:questionId', authMiddleware, createAnswer);
router.put('/upvote/:id', authMiddleware, upvoteAnswer);
router.put('/accept/:id', authMiddleware, acceptAnswer);

module.exports = router;
