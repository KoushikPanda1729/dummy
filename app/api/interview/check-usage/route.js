// app/api/interviews/[id]/route.ts
import { ratelimit } from '@/lib/ratelimiter/rateLimiter';
import dbConnect from '@/lib/mongodb/mongoose';
import User from '@/lib/mongodb/models/User';
import Usage from '@/lib/mongodb/models/Usage';
import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { ensureUserExists } from '@/lib/utils/ensureUser';

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
      return NextResponse.json({ state: true, error: 'Unauthorized', message: "Failed" }, { status: 401 });
    }

    // Step 2: Ensure user exists in MongoDB (auto-create if needed)
    try {
      await ensureUserExists(user);
    } catch (error) {
      console.error('Failed to ensure user exists:', error);
      return NextResponse.json({ state: false, error: 'Failed to initialize user', message: "Failed" }, { status: 500 });
    }

    // Fetch usage data
    const usageData = await Usage.findOne({ user_id: userId });

    if (!usageData) {
      return NextResponse.json({ state: false, error: 'Not enough Credits or access denied', message: "Failed" }, { status: 404 });
    }

    return NextResponse.json({ state: true, data: usageData, message: "Success" }, { status: 200 });
  } catch (err) {
    console.error('Server error:', err);
    return NextResponse.json({ state: false, error: 'Internal server error', message: "Failed" }, { status: 500 });
  }
}
