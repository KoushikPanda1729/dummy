import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema({
  clerk_id: {
    type: String,
    required: true,
    index: true
  },
  file_name: {
    type: String,
    required: true
  },
  file_url: {
    type: String,
    required: true
  },
  file_type: {
    type: String,
    required: true
  },
  parsed_successfully: {
    type: Boolean,
    default: false
  },
  file_content: {
    type: String,
    required: false
  }
}, {
  timestamps: true
});

export default mongoose.models.Resume || mongoose.model('Resume', resumeSchema);