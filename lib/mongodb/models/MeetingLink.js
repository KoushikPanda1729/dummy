import mongoose from 'mongoose';

const meetingLinkSchema = new mongoose.Schema({
  interview_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Interview',
    required: true,
    index: true
  },
  link: {
    type: String,
    required: true
  },
  expires_at: {
    type: Date,
    required: false
  }
}, {
  timestamps: true
});

export default mongoose.models.MeetingLink || mongoose.model('MeetingLink', meetingLinkSchema);