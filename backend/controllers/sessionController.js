const Session = require('../models/Session');
const User = require('../models/User');

const bookSession = async (req, res) => {
  try {
    const { teacherId, scheduledTime, meetingLink } = req.body;

    if (!teacherId || !scheduledTime || !meetingLink) {
      return res.status(400).json({ message: 'teacherId, scheduledTime, and meetingLink are required' });
    }

    const teacher = await User.findById(teacherId);

    if (!teacher || teacher.role !== 'teacher') {
      return res.status(400).json({ message: 'teacherId must belong to a valid teacher' });
    }

    const session = await Session.create({
      teacher: teacherId,
      student: req.user._id,
      scheduledTime,
      meetingLink,
    });

    return res.status(201).json(session);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to book session', error: error.message });
  }
};

const mySessions = async (req, res) => {
  try {
    const sessions = await Session.find({
      $or: [{ teacher: req.user._id }, { student: req.user._id }],
    })
      .populate('teacher', 'name role')
      .populate('student', 'name role')
      .sort({ scheduledTime: 1 });

    return res.status(200).json(sessions);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch sessions', error: error.message });
  }
};

const completeSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    const userId = req.user._id.toString();
    const isTeacher = session.teacher.toString() === userId;
    const isStudent = session.student.toString() === userId;

    if (!isTeacher && !isStudent) {
      return res.status(403).json({ message: 'Only session participants may complete this session' });
    }

    session.status = 'completed';
    await session.save();

    return res.status(200).json(session);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to complete session', error: error.message });
  }
};

module.exports = {
  bookSession,
  mySessions,
  completeSession,
};
