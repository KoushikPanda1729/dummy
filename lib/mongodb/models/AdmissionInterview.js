import mongoose from 'mongoose';

const admissionInterviewSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false,
    default: 'Not Available'
  },
  program_name: {
    type: String,
    required: false,
    default: 'Not Available'
  },
  session_date: {
    type: Date,
    required: false,
    default: () => new Date("2027-06-15T23:59:59Z")
  },
  resume: {
    type: String,
    required: false,
    default: 'Not Available'
  },
  question_set: {
    type: mongoose.Schema.Types.Mixed,
    required: false,
    default: 'Not Available'
  },
  feedback: {
    type: String,
    required: false,
    default: 'Not Available'
  },
  duration_minutes: {
    type: Number,
    required: false,
    default: 1800
  },
  overall_rating: {
    type: String,
    required: false,
    default: 'Not Available'
  },
  status: {
    type: String,
    required: false,
    default: 'Not Available'
  },
  user_id: {
    type: String,
    required: true,
    index: true
  }
}, {
  timestamps: true
});

export default mongoose.models.AdmissionInterview || mongoose.model('AdmissionInterview', admissionInterviewSchema);