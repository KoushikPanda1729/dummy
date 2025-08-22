import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb/mongoose';
import User from '@/lib/mongodb/models/User';
import { ratelimit } from '@/lib/ratelimiter/rateLimiter';
import { currentUser } from '@clerk/nextjs/server';

export async function POST(request) {
  try {
    await dbConnect();
    
    const ip = request.headers.get('x-forwarded-for') || 'anonymous';
    
    const { success } = await ratelimit.limit(ip);

    if (!success) {
        return NextResponse.json({ state: false, error: 'Rate limit exceeded' }, { status: 429 });
    }

    // 2. Authenticated user
    const user = await currentUser();

    console.log("************** user ********")
    console.log(user)

    const userId = user?.id;

    if (!userId) {
        return NextResponse.json({ state: false, error: 'Unauthorized', message: 'User not authenticated' }, { status: 401 });
    }

    // 3. Validate user exists in MongoDB
    const userRecord = await User.findOne({ clerk_id: userId });

    if (!userRecord) {
        return NextResponse.json({ state: false, error: 'User not found in database', message: 'Forbidden' }, { status: 403 });
    }

    const inputData = await request.json();
    console.log('Incoming Data:', inputData);

      
const updateData = await User.findOneAndUpdate(
  { clerk_id: userId },
  {
    designation: inputData?.designation || 'Not available',
    social_accounts: inputData?.social_accounts || 'Not available',
    personal_info: inputData?.personal_info || 'Not available',
    work_type: inputData?.work_type || 'Not available',
    career_status: inputData?.career_status || 'Not available',
    experience: inputData?.experience || 'Not available'
  },
  { new: true }
);

    return NextResponse.json(
      {
        state: true,
        data: updateData,
        message: 'User updated successfully',
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('Server Error:', err);
    return NextResponse.json(
      { state: false, error: 'Internal Server Error', message: 'Failed' },
      { status: 500 }
    );
  }
}
