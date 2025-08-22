import mongoose from 'mongoose';

const resumeHtmlSchema = new mongoose.Schema({
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
  html_content: {
    type: String,
    required: false
  }
}, {
  timestamps: true
});

export default mongoose.models.ResumeHtml || mongoose.model('ResumeHtml', resumeHtmlSchema);