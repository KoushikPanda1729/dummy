import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import dbConnect from '@/lib/mongodb/mongoose';
import User from '@/lib/mongodb/models/User';
import Interview from '@/lib/mongodb/models/Interview';
import InterviewAttempt from '@/lib/mongodb/models/InterviewAttempt';
import { isRateLimited } from '@/lib/utils/rateLimiter';
import { ratelimit } from '@/lib/ratelimiter/rateLimiter';



export async function GET(req) {
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

        // 5. Get interview attempts data with populated interview details
        const data = await InterviewAttempt.find({ user_id: userId })
            .populate({
                path: 'interview_id',
                model: 'Interview',
                select: 'interview_name interview_time company company_logo position location difficulty_level experience status duration interview_style job_description interview_link expiry_date salary recruiter_title employment_type job_type type current_duration'
            })
            .sort({ createdAt: -1 }); // Sort by latest

        console.log("Interview Attempts with Details:", data);

        // 6. Success
        return NextResponse.json({ state: true, data, message: 'Updated Successfully' }, { status: 201 });
    } catch (err) {
        console.error('Unexpected error:', err);
        return NextResponse.json({ state: false, error: 'Server Error', message: 'Something went wrong' }, { status: 500 });
    }
}

