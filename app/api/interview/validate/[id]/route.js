// app/api/interviews/[id]/route.ts
import { ratelimit } from '@/lib/ratelimiter/rateLimiter';
import dbConnect from '@/lib/mongodb/mongoose';
import User from '@/lib/mongodb/models/User';
import Interview from '@/lib/mongodb/models/Interview';
import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { ensureUserExists } from '@/lib/utils/ensureUser';

export async function GET(req, context) {
  const ip = req.headers.get('x-forwarded-for') || 'anonymous';

  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return NextResponse.json({ state: false, error: 'Rate limit exceeded' }, { status: 429 });
  }
  try {
    await dbConnect();

    const param = await context.params;
    const interviewId = param.id;

    console.log('Interview ID:', interviewId);

    // Validate the interview ID
    if (!interviewId || interviewId === 'undefined' || interviewId === 'null') {
      return NextResponse.json({ state: false, error: 'Invalid interview ID', message: "Failed" }, { status: 400 });
    }

    // Check if it's a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(interviewId)) {
      return NextResponse.json({ state: false, error: 'Invalid interview ID format', message: "Failed" }, { status: 400 });
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

    // Fetch interview
    const interview = await Interview.findById(interviewId);

    if (!interview) {
      return NextResponse.json({ state: false, error: 'Interview not found or access denied', message: "Failed" }, { status: 404 });
    }

    // Verify the interview belongs to the current user
    if (interview.user_id !== userId) {
      return NextResponse.json({ state: false, error: 'Access denied to this interview', message: "Failed" }, { status: 403 });
    }

    // Include both _id and id for frontend compatibility
    const responseData = {
      ...interview.toObject(),
      id: interview._id.toString()
    };

    return NextResponse.json({ state: true, data: responseData, message: "Success" }, { status: 200 });
  } catch (err) {
    console.error('Server error:', err);
    return NextResponse.json({ state: false, error: 'Internal server error', message: "Failed" }, { status: 500 });
  }
}
