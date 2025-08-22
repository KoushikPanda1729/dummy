import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  plan: {
    type: String,
    required: true
  },
  started_at: {
    type: Date,
    required: true
  },
  expires_at: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'inactive', 'cancelled', 'expired'],
    default: 'active'
  }
}, {
  timestamps: true
});

export default mongoose.models.Subscription || mongoose.model('Subscription', subscriptionSchema);