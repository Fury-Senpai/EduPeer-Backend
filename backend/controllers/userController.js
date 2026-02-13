const User = require('../models/User');
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const Session = require('../models/Session');
const { calculateEduCoins } = require('../utils/karmaUtils');

const getLeaderboard = async (_req, res) => {
  try {
    const leaderboard = await User.find()
      .select('name karma')
      .sort({ karma: -1 })
      .limit(10);

    return res.status(200).json(leaderboard);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch leaderboard', error: error.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('name role karma');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const [questionCount, answerCount, sessionCount] = await Promise.all([
      Question.countDocuments({ author: user._id }),
      Answer.countDocuments({ author: user._id }),
      Session.countDocuments({
        $or: [{ teacher: user._id }, { student: user._id }],
      }),
    ]);

    return res.status(200).json({
      id: user._id,
      name: user.name,
      role: user.role,
      karma: user.karma,
      eduCoins: calculateEduCoins(user.karma),
      totals: {
        questions: questionCount,
        answers: answerCount,
        sessions: sessionCount,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch user profile', error: error.message });
  }
};

module.exports = {
  getLeaderboard,
  getUserProfile,
};
