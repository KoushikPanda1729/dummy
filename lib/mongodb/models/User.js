import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  clerk_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: false
  },
  first_name: {
    type: String,
    required: false
  },
  last_name: {
    type: String,
    required: false
  },
  profile_image: {
    type: String,
    required: false
  },
  usage_count: {
    type: Number,
    default: 0
  },
  subscription_status: {
    type: String,
    enum: ['active', 'inactive', 'cancelled'],
    default: 'inactive'
  },
  subscription_plan: {
    type: String,
    required: false
  },
  designation: {
    type: String,
    required: false
  },
  social_accounts: {
    type: mongoose.Schema.Types.Mixed,
    required: false
  },
  personal_info: {
    type: mongoose.Schema.Types.Mixed,
    required: false
  },
  work_type: {
    type: String,
    required: false
  },
  career_status: {
    type: String,
    required: false
  },
  experience: {
    type: String,
    required: false
  }
}, {
  timestamps: true
});

export default mongoose.models.User || mongoose.model('User', userSchema);