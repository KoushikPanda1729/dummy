import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import dbConnect from '@/lib/mongodb/mongoose';
import User from '@/lib/mongodb/models/User';
import Usage from '@/lib/mongodb/models/Usage';
import { isRateLimited } from '@/lib/utils/rateLimiter';
import { ratelimit } from '@/lib/ratelimiter/rateLimiter';
import generateUuid from '@/lib/utils/generateUuid';



export async function POST(req) {
    try {
        await dbConnect();
        
        const ip = req.headers.get('x-forwarded-for') || 'anonymous';

        const { success } = await ratelimit.limit(ip);

        if (!success) {
            return NextResponse.json({ state: false, error: 'Rate limit exceeded' }, { status: 429 });
        }
        // 1. Rate limiting (basic IP-based)
        const ip_address = req.headers.get('x-forwarded-for') || 'localhost';
        if (isRateLimited(ip_address)) {
            return NextResponse.json({ state: false, error: 'Too many requests', message: 'Rate limit exceeded' }, { status: 429 });
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

        // 5. Insert usage data
        const usage = new Usage({
            user_id: userId,
            remaining_minutes: 300,
            last_reset: new Date()
        });

        const savedUsage = await usage.save();

        // 6. Success
        return NextResponse.json({ state: true, data: savedUsage, message: 'Updated Successfully' }, { status: 201 });
    } catch (err) {
        console.error('Unexpected error:', err);
        return NextResponse.json({ state: false, error: 'Server Error', message: 'Something went wrong' }, { status: 500 });
    }
}

