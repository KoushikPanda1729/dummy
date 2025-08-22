// app/api/interviews/[id]/route.ts
import { ratelimit } from '@/lib/ratelimiter/rateLimiter';
import dbConnect from '@/lib/mongodb/mongoose';
import Interview from '@/lib/mongodb/models/Interview';
import { isRateLimited } from '@/lib/utils/rateLimiter';
import { NextResponse } from 'next/server';
import { z } from 'zod';


const ParamsSchema = z.object({
  id: z.string().uuid({ message: 'Invalid interview ID format' })
});

export async function GET(req, context) {
  try {
    await dbConnect();

    const ip = req.headers.get('x-forwarded-for') || 'anonymous';
        
    const { success } = await ratelimit.limit(ip);
        
    if (!success) {
        return NextResponse.json({ state: false, error: 'Rate limit exceeded' }, { status: 429 });
    }

    const param = await context.params;
    const interviewId = param.id;

    console.log(interviewId);

    // Fetch interview
    const interview = await Interview.findById(interviewId);

    if (!interview) {
      return NextResponse.json({ state: false, error: 'Interview not found or access denied', message: "Failed" }, { status: 404 });
    }

    return NextResponse.json({ state: true, data: interview, message: "Success" }, { status: 200 });
  } catch (err) {
    console.error('Server error:', err);
    return NextResponse.json({ state: false, error: 'Internal server error', message: "Failed" }, { status: 500 });
  }
}
