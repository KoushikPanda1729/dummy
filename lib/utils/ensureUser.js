import dbConnect from '@/lib/mongodb/mongoose';
import User from '@/lib/mongodb/models/User';
import Usage from '@/lib/mongodb/models/Usage';

export async function ensureUserExists(clerkUser) {
  try {
    await dbConnect();
    
    // Check if user already exists
    let user = await User.findOne({ clerk_id: clerkUser.id });
    
    if (!user) {
      console.log('🔄 Creating user in MongoDB:', clerkUser.id);
      
      // Create user
      user = new User({
        clerk_id: clerkUser.id,
        email: clerkUser.emailAddresses?.[0]?.emailAddress || clerkUser.email || '',
        first_name: clerkUser.firstName || '',
        last_name: clerkUser.lastName || '',
        profile_image: clerkUser.imageUrl || '',
        usage_count: 0,
        subscription_status: 'inactive'
      });

      const savedUser = await user.save();
      console.log('✅ User created in MongoDB:', savedUser._id);

      // Create usage record
      const usage = new Usage({
        user_id: clerkUser.id,
        remaining_minutes: 300,
        last_reset: new Date(),
      });

      await usage.save();
      console.log('✅ Usage record created for user:', clerkUser.id);
    }
    
    return user;
  } catch (error) {
    console.error('❌ Error ensuring user exists:', error);
    throw error;
  }
}