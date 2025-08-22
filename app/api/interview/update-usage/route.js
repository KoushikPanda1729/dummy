import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import dbConnect from '@/lib/mongodb/mongoose';
import User from '@/lib/mongodb/models/User';
import Usage from '@/lib/mongodb/models/Usage';
import { isRateLimited } from '@/lib/utils/rateLimiter';
import { ratelimit } from '@/lib/ratelimiter/rateLimiter';



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

    // 3. Validate user exists in MongoDB
    const userRecord = await User.findOne({ clerk_id: userId });

    if (!userRecord) {
      return NextResponse.json({ state: false, error: 'User not found in database', message: 'Forbidden' }, { status: 403 });
    }

    // 4. Validate request body
    const { usage_in_seconds } = await req.json();

    // fetch usages
    const usage = await Usage.findOne({ user_id: userId });

    if (!usage) {
      return NextResponse.json({ state: false, error: 'Failed to fetch the usage', message: "Failed" }, { status: 404 });
    }

    console.log(usage)

    // 5. Update usage data
    const updated_remaining_minutes = usage.remaining_minutes - usage_in_seconds;

    const updatedUsage = await Usage.findOneAndUpdate(
      { user_id: userId },
      { remaining_minutes: updated_remaining_minutes },
      { new: true }
    );

    // 6. Success
    return NextResponse.json({ state: true, data: updatedUsage, message: 'Updated Successfully' }, { status: 201 });
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ state: false, error: 'Server Error', message: 'Something went wrong' }, { status: 500 });
  }
}

