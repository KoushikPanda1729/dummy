import mongoose from 'mongoose';

const interviewAttemptSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    index: true
  },
  interview_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Interview',
    required: true,
    index: true
  },
  started_at: {
    type: Date,
    default: Date.now
  },
  interview_attempt: {
    type: mongoose.Schema.Types.Mixed,
    required: false
  },
  status: {
    type: String,
    enum: ['started', 'completed', 'abandoned', 'in-progress'],
    default: 'started'
  },
  chat_conversation: {
    type: mongoose.Schema.Types.Mixed,
    required: false
  },
  score: {
    type: Number,
    required: false
  },
  feedback: {
    type: String,
    required: false
  }
}, {
  timestamps: true
});

// Clear the model cache to ensure schema updates are applied
if (mongoose.models.InterviewAttempt) {
  delete mongoose.models.InterviewAttempt;
}

export default mongoose.model('InterviewAttempt', interviewAttemptSchema);