// app/api/upload/route.ts
import { ratelimit } from '@/lib/ratelimiter/rateLimiter';
import dbConnect from '@/lib/mongodb/mongoose';
import User from '@/lib/mongodb/models/User';
import ResumeHtml from '@/lib/mongodb/models/ResumeHtml';
import { isRateLimited } from '@/lib/utils/rateLimiter';
import { currentUser } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server'


export async function POST(req) {
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
    const userId = user?.id;

    if (!userId) {
        return NextResponse.json({ state: false, error: 'Unauthorized', message: 'User not authenticated' }, { status: 401 });
    }

    // 3. Validate user exists in MongoDB
    await dbConnect();
    const userRecord = await User.findOne({ clerk_id: userId });

    if (!userRecord) {
        return NextResponse.json({ state: false, error: 'User not found in database', message: 'Forbidden' }, { status: 403 });
    }

    const { html_content, } = await req.json();

    // Insert metadata into 'resume_html' collection
    try {
        const resumeHtml = new ResumeHtml({
            clerk_id: userId,
            file_name: `resume-${Date.now()}`,
            file_url: 'https://hirenom.pdf',
            file_type: 'pdf',
            parsed_successfully: false,
            html_content: html_content
        });

        const savedResumeHtml = await resumeHtml.save();
        
        return NextResponse.json({ state: true, data: savedResumeHtml, message: 'Resume inserted successfully!' }, { status: 201 });
    } catch (resumeError) {
        console.log("DB Error:", resumeError.message)
        return NextResponse.json({ state: false, error: resumeError.message, message: 'Failed' }, { status: 500 });
    }

}
