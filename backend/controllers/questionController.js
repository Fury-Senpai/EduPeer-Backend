const Question = require('../models/Question');
const User = require('../models/User');

const createQuestion = async (req, res) => {
  try {
    const { title, description, subject } = req.body;

    if (!title || !description || !subject) {
      return res.status(400).json({ message: 'title, description, and subject are required' });
    }

    const question = await Question.create({
      title,
      description,
      subject,
      author: req.user._id,
    });

    return res.status(201).json(question);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create question', error: error.message });
  }
};

const listQuestions = async (_req, res) => {
  try {
    const questions = await Question.find()
      .populate('author', 'name role karma')
      .sort({ createdAt: -1 });

    return res.status(200).json(questions);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to list questions', error: error.message });
  }
};

const getQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id).populate('author', 'name role karma');

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    return res.status(200).json(question);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to get question', error: error.message });
  }
};

const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    if (question.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the question author may delete this question' });
    }

    await question.deleteOne();

    return res.status(200).json({ message: 'Question deleted' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete question', error: error.message });
  }
};

const upvoteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const hasUpvoted = question.upvotes.some(
      (userId) => userId.toString() === req.user._id.toString()
    );

    if (hasUpvoted) {
      return res.status(400).json({ message: 'Question already upvoted by this user' });
    }

    question.upvotes.push(req.user._id);
    await question.save();

    await User.findByIdAndUpdate(question.author, { $inc: { karma: 5 } });

    return res.status(200).json(question);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to upvote question', error: error.message });
  }
};

module.exports = {
  createQuestion,
  listQuestions,
  getQuestion,
  deleteQuestion,
  upvoteQuestion,
};
