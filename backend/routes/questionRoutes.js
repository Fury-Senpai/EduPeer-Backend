const express = require('express');

const {
  createQuestion,
  listQuestions,
  getQuestion,
  deleteQuestion,
  upvoteQuestion,
} = require('../controllers/questionController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', listQuestions);
router.get('/:id', getQuestion);
router.post('/', authMiddleware, createQuestion);
router.delete('/:id', authMiddleware, deleteQuestion);
router.put('/upvote/:id', authMiddleware, upvoteQuestion);
router.post('/:id/upvote', authMiddleware, upvoteQuestion);

module.exports = router;
