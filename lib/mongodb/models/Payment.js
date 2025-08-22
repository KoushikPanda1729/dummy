import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true
  },
  payment_provider: {
    type: String,
    required: true,
    default: 'stripe'
  },
  payment_status: {
    type: String,
    required: true
  },
  transaction_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  credits: {
    type: Number,
    required: false,
    default: 100
  },
  remarks: {
    type: String,
    required: false
  },
  customer_id: {
    type: String,
    required: false
  },
  invoice_id: {
    type: String,
    required: false
  },
  receipt_url: {
    type: String,
    required: false
  },
  payment_intent_id: {
    type: String,
    required: false
  }
}, {
  timestamps: true
});

export default mongoose.models.Payment || mongoose.model('Payment', paymentSchema);