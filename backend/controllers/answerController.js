const mongoose = require('mongoose');

const Answer = require('../models/Answer');
const Question = require('../models/Question');
const User = require('../models/User');

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

    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    const hasUpvoted = answer.upvotes.some(
      (userId) => userId.toString() === req.user._id.toString()
    );

    if (hasUpvoted) {
      return res.status(400).json({ message: 'Answer already upvoted by this user' });
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

    const question = await Question.findById(answer.question);

    if (!question) {
      return res.status(404).json({ message: 'Question not found for this answer' });
    }

    if (question.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the question author may accept an answer' });
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

    await User.findByIdAndUpdate(answer.author, { $inc: { karma: 20 } });

    return res.status(200).json(answer);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to accept answer', error: error.message });
  }
};

module.exports = {
  createAnswer,
  upvoteAnswer,
  acceptAnswer,
};
