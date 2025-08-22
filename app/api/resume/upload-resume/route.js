// app/api/upload/route.ts
import { ratelimit } from '@/lib/ratelimiter/rateLimiter';
import dbConnect from '@/lib/mongodb/mongoose';
import User from '@/lib/mongodb/models/User';
import Resume from '@/lib/mongodb/models/Resume';
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

    console.log("************** user ********")
    console.log(user)

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
    const formData = await req.formData()

    const file = formData.get('file');
    const clerkId = formData.get('clerkId');

    if (!file || !clerkId) {
        return NextResponse.json({ state: false, error: 'Missing file or user', message: 'Failed' }, { status: 400 });

    }

    const fileExt = file.name.split('.').pop()
    const fileName = `${crypto.randomUUID()}.${fileExt}`
    const filePath = `resumes/${fileName}`

    // For now, store file content as base64 in database
    // In production, you might want to use AWS S3, Cloudinary, or similar service
    const fileBuffer = Buffer.from(await file.arrayBuffer())
    const fileBase64 = fileBuffer.toString('base64')
    
    // Create a mock URL for the file (you can replace this with actual storage service URL)
    const fileUrl = `${process.env.NEXT_APP_HOSTNAME}/api/resume/file/${fileName}`

    // Insert metadata into 'resumes' collection
    try {
        const resume = new Resume({
            clerk_id: clerkId,
            file_name: file.name,
            file_url: fileUrl,
            file_type: file.type,
            parsed_successfully: false,
            file_content: fileBase64 // Store file content in database for now
        });

        await resume.save();
    } catch (dbError) {
        console.log("DB Error:", dbError.message)
        return NextResponse.json({ state: false, error: dbError.message, message: 'Failed' }, { status: 500 });
    }

    return NextResponse.json({ state: true, data: 'Resume uploaded successfully!', message: 'Success' }, { status: 201 });


}
