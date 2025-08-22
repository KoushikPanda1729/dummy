import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { ensureUserExists } from '@/lib/utils/ensureUser';

export async function POST(req) {
  try {
    // Get the current Clerk user
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ 
        state: false, 
        error: 'No authenticated user found' 
      }, { status: 401 });
    }

    console.log('🔄 Testing user creation for:', user.id);
    
    // Ensure user exists in MongoDB
    const mongoUser = await ensureUserExists(user);
    
    return NextResponse.json({ 
      state: true, 
      message: 'User created successfully',
      data: {
        clerk_id: mongoUser.clerk_id,
        email: mongoUser.email,
        first_name: mongoUser.first_name,
        last_name: mongoUser.last_name
      }
    }, { status: 200 });
    
  } catch (error) {
    console.error('❌ Error creating user:', error);
    return NextResponse.json({ 
      state: false, 
      error: error.message 
    }, { status: 500 });
  }
}