import mongoose from 'mongoose';

const interviewSchema = new mongoose.Schema({
  interview_name: {
    type: String,
    required: true
  },
  interview_time: {
    type: String,
    required: false
  },
  company_logo: {
    type: String,
    required: false
  },
  company: {
    type: String,
    required: false
  },
  status: {
    type: String,
    required: false
  },
  interview_type: {
    type: String,
    required: false
  },
  duration: {
    type: Number,
    required: false
  },
  position: {
    type: String,
    required: false
  },
  location: {
    type: String,
    required: false
  },
  interview_style: {
    type: String,
    required: false
  },
  job_description: {
    type: String,
    required: false
  },
  interview_link: {
    type: String,
    required: false
  },
  expiry_date: {
    type: Date,
    required: false
  },
  user_id: {
    type: String,
    required: true,
    index: true
  },
  difficulty_level: {
    type: String,
    required: false
  },
  experience: {
    type: String,
    required: false
  },
  questions: {
    type: mongoose.Schema.Types.Mixed,
    required: false
  },
  type: {
    type: String,
    default: 'INTERVIEW'
  },
  college_interview: {
    type: mongoose.Schema.Types.Mixed,
    required: false
  }
}, {
  timestamps: true
});

export default mongoose.models.Interview || mongoose.model('Interview', interviewSchema);