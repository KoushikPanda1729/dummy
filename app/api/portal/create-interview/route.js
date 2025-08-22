import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import dbConnect from '@/lib/mongodb/mongoose';
import User from '@/lib/mongodb/models/User';
import AdmissionInterview from '@/lib/mongodb/models/AdmissionInterview';
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

    // 4. Validate user exists in MongoDB
    const userRecord = await User.findOne({ clerk_id: userId });

    if (!userRecord) {
      return NextResponse.json({ state: false, error: 'User not found in database', message: 'Forbidden' }, { status: 403 });
    }

    // 5. Validate request body
    const { formData, questions } = await req.json();

    // 6. Create new admission interview
    const admissionInterview = new AdmissionInterview({
      name: formData?.name || 'Not Available',
      program_name: formData?.program_name || 'Not Available',
      session_date: formData?.session_date || "2027-06-15T23:59:59Z",
      resume: formData?.resume || 'Not Available',
      question_set: questions || 'Not Available',
      feedback: formData?.feedback || 'Not Available',
      duration_minutes: (formData?.duration_minutes * 60) || 1800,
      overall_rating: formData?.overall_rating || 'Not Available',
      status: formData?.status || 'Not Available',
      user_id: userId
    });

    const savedInterview = await admissionInterview.save();

    if (!savedInterview) {
      console.error('MongoDB insert error');
      return NextResponse.json({ state: false, error: 'Failed to save interview', message: 'Database error' }, { status: 500 });
    }

    // Include both _id and id for frontend compatibility
    const responseData = {
      ...savedInterview.toObject(),
      id: savedInterview._id.toString()
    };

    // 7. Success
    return NextResponse.json({ state: true, data: [responseData], message: 'Interview created' }, { status: 201 });
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ state: false, error: 'Server Error', message: 'Something went wrong' }, { status: 500 });
  }
}

