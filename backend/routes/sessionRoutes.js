const express = require('express');

const {
  bookSession,
  mySessions,
  completeSession,
} = require('../controllers/sessionController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/book', authMiddleware, bookSession);
router.get('/my', authMiddleware, mySessions);
router.patch('/:id/complete', authMiddleware, completeSession);

module.exports = router;
