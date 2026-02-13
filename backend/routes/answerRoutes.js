const express = require('express');

const {
  createAnswer,
  upvoteAnswer,
  acceptAnswer,
} = require('../controllers/answerController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/:questionId', authMiddleware, createAnswer);
router.put('/upvote/:id', authMiddleware, upvoteAnswer);
router.post('/:id/upvote', authMiddleware, upvoteAnswer);
router.put('/accept/:id', authMiddleware, acceptAnswer);
router.patch('/:id/accept', authMiddleware, acceptAnswer);

module.exports = router;
