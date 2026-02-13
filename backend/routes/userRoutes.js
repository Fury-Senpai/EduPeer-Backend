const express = require('express');

const { getLeaderboard, getUserProfile } = require('../controllers/userController');

const router = express.Router();

router.get('/leaderboard', getLeaderboard);
router.get('/:id', getUserProfile);

module.exports = router;
