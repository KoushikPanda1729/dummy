import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import dbConnect from '@/lib/mongodb/mongoose';
import User from '@/lib/mongodb/models/User';
import Interview from '@/lib/mongodb/models/Interview';
import { ratelimit } from '@/lib/ratelimiter/rateLimiter';


export async function GET(req) {
  try {
    await dbConnect();
    
    const ip = req.headers.get('x-forwarded-for') || 'anonymous';

    const { success } = await ratelimit.limit(ip);

    if (!success) {
      return NextResponse.json({ state: false, error: 'Rate limit exceeded' }, { status: 429 });
    }

    // Step 1: Get authenticated Clerk user
    const user = await currentUser();
    const userId = user?.id;

    if (!userId) {
      return NextResponse.json({ state: false, error: 'Unauthorized', message: "Failed" }, { status: 401 });
    }

    // Step 3: Verify the user exists in MongoDB "users" collection
    const userRecord = await User.findOne({ clerk_id: userId });

    if (!userRecord) {
      return NextResponse.json({ state: false, error: 'User not found in database', message: "Failed" }, { status: 403 });
    }

    // Step 5: Fetch all interviews  
    const interviews = await Interview.find({ 
      user_id: userId,
      type: 'INTERVIEW'
    }).sort({ createdAt: -1 }); // Sort by latest

    // Add id field for frontend compatibility
    const responseData = interviews.map(interview => ({
      ...interview.toObject(),
      id: interview._id.toString()
    }));

    return NextResponse.json({ state: true, data: responseData, message: "Success" }, { status: 200 });

  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ state: false, error: 'Internal Server Error', message: "Failed" }, { status: 500 });
  }
}