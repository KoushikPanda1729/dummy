import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import dbConnect from '@/lib/mongodb/mongoose';
import User from '@/lib/mongodb/models/User';
import Interview from '@/lib/mongodb/models/Interview';
import { ratelimit } from '@/lib/ratelimiter/rateLimiter';
import { ensureUserExists } from '@/lib/utils/ensureUser';



export async function POST(req) {
  try {
    await dbConnect();
    
    const ip = req.headers.get('x-forwarded-for') || 'anonymous';

    const { success } = await ratelimit.limit(ip);

    if (!success) {
      return NextResponse.json({ state: false, error: 'Rate limit exceeded' }, { status: 429 });
    }

    // 2. Authenticated user
    const user = await currentUser();
    const userId = user?.id;
    if (!userId) {
      return NextResponse.json({ state: false, error: 'Unauthorized', message: 'User not authenticated' }, { status: 401 });
    }

    // 3. Ensure user exists in MongoDB
    try {
      await ensureUserExists(user);
    } catch (error) {
      console.error('Failed to ensure user exists:', error);
      return NextResponse.json({ state: false, error: 'Failed to initialize user', message: 'Database error' }, { status: 500 });
    }

    // 4. Validate request body
    const { currentDuration, interviewId, status } = await req.json();

    // Fetch interview
    const interviewData = await Interview.findOne({
      _id: interviewId,
      user_id: userId
    });

    console.log("+++++++++++++ interview fetch ++++++++++++++")
    console.log("Interview found:", !!interviewData);

    if (!interviewData) {
      return NextResponse.json({ state: false, error: 'Interview not found or access denied', message: "Failed" }, { status: 404 });
    }

    const current = Number(interviewData?.current_duration || 0);
    const newDuration = Number(currentDuration || 0);

    const new_current_duration = current + newDuration;
    console.log("new_current_duration", new_current_duration);
    console.log("status", status);

    // 5. Update interview data    
    const updatedInterview = await Interview.findByIdAndUpdate(
      interviewId,
      { 
        current_duration: new_current_duration, 
        status: status 
      },
      { new: true }
    );

    console.log("============== update interview ================");
    console.log("Updated interview:", updatedInterview);

    if (!updatedInterview) {
      console.error('MongoDB update error: Interview not found');
      return NextResponse.json({ state: false, error: 'Failed to update interview', message: 'Database error' }, { status: 500 });
    }

    // Include both _id and id for frontend compatibility
    const responseData = {
      ...updatedInterview.toObject(),
      id: updatedInterview._id.toString()
    };

    // 6. Success
    return NextResponse.json({ state: true, data: responseData, message: 'Updated Successfully' }, { status: 201 });
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ state: false, error: 'Server Error', message: 'Something went wrong' }, { status: 500 });
  }
}

