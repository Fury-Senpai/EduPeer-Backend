const mongoose = require('mongoose');

const Answer = require('../models/Answer');
const Question = require('../models/Question');
const User = require('../models/User');


const getAnswersByQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;

    if (!mongoose.isValidObjectId(questionId)) {
      return res.status(400).json({ message: 'Invalid question id' });
    }

    const question = await Question.findById(questionId);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const answers = await Answer.find({ question: questionId })
      .populate('author', 'name role karma')
      .sort({ createdAt: -1 });

    const sortedAnswers = answers.sort((a, b) => {
      const upvoteDiff = b.upvotes.length - a.upvotes.length;

      if (upvoteDiff !== 0) {
        return upvoteDiff;
      }

      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return res.status(200).json(sortedAnswers);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch answers', error: error.message });
  }
};

const createAnswer = async (req, res) => {
  try {
    const { content } = req.body;
    const { questionId } = req.params;

    if (!content) {
      return res.status(400).json({ message: 'content is required' });
    }

    if (!mongoose.isValidObjectId(questionId)) {
      return res.status(400).json({ message: 'Invalid question id' });
    }

    const question = await Question.findById(questionId);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const answer = await Answer.create({
      question: questionId,
      content,
      author: req.user._id,
    });

    return res.status(201).json(answer);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create answer', error: error.message });
  }
};

const upvoteAnswer = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid answer id' });
    }

    const answer = await Answer.findById(id);

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid answer id' });
    }

    answer.upvotes.push(req.user._id);
    await answer.save();

    await User.findByIdAndUpdate(answer.author, { $inc: { karma: 10 } });

    return res.status(200).json(answer);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to upvote answer', error: error.message });
  }
};

const acceptAnswer = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid answer id' });
    }

    const answer = await Answer.findById(id);

    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    const voterId = req.user._id.toString();
    const existingIndex = answer.upvotes.findIndex((userId) => userId.toString() === voterId);

    if (existingIndex >= 0) {
      answer.upvotes.splice(existingIndex, 1);
      await answer.save();
      await User.findByIdAndUpdate(answer.author, { $inc: { karma: -10 } });

      return res.status(200).json({
        answer,
        voteStatus: 'removed',
      });
    }

    if (answer.isAccepted) {
      return res.status(400).json({ message: 'Answer is already accepted' });
    }

    const previouslyAccepted = await Answer.findOne({
      question: answer.question,
      isAccepted: true,
    });

    if (previouslyAccepted) {
      return res.status(400).json({ message: 'This question already has an accepted answer' });
    }

    answer.isAccepted = true;
    await answer.save();
    await User.findByIdAndUpdate(answer.author, { $inc: { karma: 10 } });

    return res.status(200).json({
      answer,
      voteStatus: 'upvoted',
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to toggle answer upvote', error: error.message });
  }
};

module.exports = {
  getAnswersByQuestion,
  createAnswer,
  upvoteAnswer,
};
