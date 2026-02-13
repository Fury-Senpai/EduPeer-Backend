const { Schema, model } = require('mongoose');

const sessionSchema = new Schema({
  teacher: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  student: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  scheduledTime: {
    type: Date,
    required: true,
  },
  meetingLink: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed'],
    default: 'scheduled',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = model('Session', sessionSchema);
