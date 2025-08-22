import mongoose from 'mongoose';

const usageSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    index: true
  },
  remaining_minutes: {
    type: Number,
    default: 300
  },
  last_reset: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.models.Usage || mongoose.model('Usage', usageSchema);