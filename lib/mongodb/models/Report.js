import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
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
  interview_attempt_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InterviewAttempt',
    required: false
  },
  report_data: {
    type: mongoose.Schema.Types.Mixed,
    required: false
  },
  overall_score: {
    type: Number,
    required: false
  },
  detailed_feedback: {
    type: String,
    required: false
  },
  strengths: {
    type: [String],
    required: false
  },
  areas_for_improvement: {
    type: [String],
    required: false
  },
  recommendations: {
    type: [String],
    required: false
  }
}, {
  timestamps: true
});

export default mongoose.models.Report || mongoose.model('Report', reportSchema);