import dbConnect from '@/lib/mongodb/mongoose';
import Payment from '@/lib/mongodb/models/Payment';
import Subscription from '@/lib/mongodb/models/Subscription';
import User from '@/lib/mongodb/models/User';
import { PLAN_LIMITS } from '@/lib/utils/constants/plan';
import crypto from 'crypto';
import { addMonths } from 'date-fns';

export async function checkPaymentExists(transactionId) {
  try {
    await dbConnect();
    
    const existingPayment = await Payment.findOne({ transaction_id: transactionId });

    return !!existingPayment;
  } catch (error) {
    console.error('Database checkPaymentExists error:', error);
    throw error;
  }
}

export function createPaymentData(session, userId, invoice, credits) {
  return {
    user_id: userId,
    amount: (session.amount_total || 0) / 100,
    payment_provider: 'stripe',
    payment_status: session.payment_status,
    transaction_id: session.id,
    credits: credits || 100,
    remarks: session.metadata?.description || 'Stripe Purchase',
    customer_id: typeof session.customer === 'string' ? session.customer : null,
    invoice_id: typeof session.invoice === 'string' ? session.invoice : null,
    receipt_url: invoice?.hosted_invoice_url || null,
    payment_intent_id: typeof session.payment_intent === 'string' ? invoice?.payment_intent : null,
  };
}

export default async function savePayment(paymentData) {
  try {
    await dbConnect();
    
    const payment = new Payment(paymentData);
    await payment.save();

    console.log('✅ Payment record saved successfully.');
  } catch (error) {
    if (error.code === 11000) {
      console.log('⚠️ Payment already exists (duplicate webhook)');
      return;
    }
    console.error('❌ MongoDB insert error:', error.message);
    console.error('Database savePayment error:', error);
    throw error;
  }
}

export async function upsertSubscription(userId, plan) {
  try {
    await dbConnect();
    
    const startedAt = new Date();
    const expiresAt = addMonths(startedAt, 1);

    await Subscription.findOneAndUpdate(
      { user_id: userId },
      { 
        user_id: userId,
        plan,
        started_at: startedAt,
        expires_at: expiresAt,
        status: 'active'
      },
      { 
        upsert: true,
        new: true
      }
    );

    console.log('✅ Subscription upserted successfully');
  } catch (error) {
    console.error('❌ Failed to upsert subscription:', error.message);
    throw new Error('Failed to upsert subscription');
  }
}

// ADD minutes to existing usage (for ALL payment types)
export async function upsertUsage(userId, credits) {
  const limits = PLAN_LIMITS[credits] || PLAN_LIMITS['20'];

  console.log("============ ADDING USAGE =================");
  console.log('Adding minutes:', limits.minutes);
  console.log('User:', userId);

  try {
    await dbConnect();
    
    const additionalSeconds = (limits.minutes) * 60;
    const resetTime = new Date();

    // Find the user and increment their remaining minutes
    const user = await User.findOneAndUpdate(
      { clerk_id: userId },
      { 
        $inc: { remaining_minutes: additionalSeconds },
        $set: { last_reset: resetTime }
      },
      { new: true, upsert: true }
    );

    console.log(`✅ Added ${limits.minutes} minutes to user's usage (old + new)`);
    console.log(`User now has ${user.remaining_minutes} seconds remaining`);
  } catch (error) {
    console.error('❌ Error updating usage:', error);
    throw error;
  }
}

// RESET usage to plan limits (keeping this for potential future use)
export async function resetUsage(userId, credits) {
  const limits = PLAN_LIMITS[credits] || PLAN_LIMITS['20'];

  console.log("============ RESETTING USAGE =================");
  console.log('Resetting minutes to:', limits.minutes);

  try {
    await dbConnect();
    
    const resetTime = new Date();
    const resetSeconds = limits.minutes * 60;

    // Find the user and reset their remaining minutes
    const user = await User.findOneAndUpdate(
      { clerk_id: userId },
      { 
        $set: { 
          remaining_minutes: resetSeconds,
          last_reset: resetTime 
        }
      },
      { new: true, upsert: true }
    );

    console.log(`✅ Reset usage to ${limits.minutes} minutes for user`);
    console.log(`User now has ${user.remaining_minutes} seconds remaining`);
  } catch (error) {
    console.error('❌ Error resetting usage:', error);
    throw error;
  }
}