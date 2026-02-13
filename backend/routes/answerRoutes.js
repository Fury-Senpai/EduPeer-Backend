const express = require('express');

const {
  createAnswer,
  upvoteAnswer,
  acceptAnswer,
} = require('../controllers/answerController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/:questionId', authMiddleware, createAnswer);
router.post('/:id/upvote', authMiddleware, upvoteAnswer);
router.patch('/:id/accept', authMiddleware, acceptAnswer);

module.exports = router;
