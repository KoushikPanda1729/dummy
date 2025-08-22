import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import dbConnect from '@/lib/mongodb/mongoose';
import User from '@/lib/mongodb/models/User';
import Interview from '@/lib/mongodb/models/Interview';
import MeetingLink from '@/lib/mongodb/models/MeetingLink';
import { isRateLimited } from '@/lib/utils/rateLimiter';
import { z } from 'zod';
import { ratelimit } from '@/lib/ratelimiter/rateLimiter';
import { ensureUserExists } from '@/lib/utils/ensureUser';


// Zod Schema for validation
const InterviewSchema = z.object({
  interview_name: z.string().min(1),
  job_description: z.string().min(1),
  interview_time: z.string().refine((val) => !isNaN(Date.parse(val))),
  company_logo: z.string().url().optional(),
  status: z.string().min(1),
  interview_type: z.string().min(1),
  interview_style: z.string().min(1),
  duration: z.string().min(1),
  position: z.string().min(1),
  location: z.string().min(1),
  experience: z.string().min(1),
  difficulty_level: z.string().min(1),
  company: z.string().min(1),
});


export async function GET() {
  try {
    await dbConnect();

    // Join interviews with their associated meeting links
    const interviews = await Interview.aggregate([
      {
        $lookup: {
          from: 'meetinglinks',
          localField: '_id',
          foreignField: 'interview_id',
          as: 'meeting_links'
        }
      },
      {
        $addFields: {
          meeting_link: { $arrayElemAt: ['$meeting_links', 0] },
          id: { $toString: '$_id' }
        }
      }
    ]);

    return NextResponse.json({ state: true, data: interviews, message: "Success" }, { status: 200 });

  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ state: false, error: 'Internal Server Error', message: "Failed" }, { status: 500 });
  }
}

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

    // 3. Ensure user exists in MongoDB (auto-create if needed)
    try {
      await ensureUserExists(user);
    } catch (error) {
      console.error('Failed to ensure user exists:', error);
      return NextResponse.json({ state: false, error: 'Failed to initialize user', message: 'Database error' }, { status: 500 });
    }

    // 4. Validate request body
    const { formData, questions, college_interview_data } = await req.json();
    // const parsed = InterviewSchema.safeParse(body);
    // console.log(parsed.error)
    // if (!parsed.success) {
    //   return NextResponse.json({ state: false, error: parsed.error.flatten(), message: 'Invalid data' }, { status: 400 });
    // }

    //     const inputdata = {
    //   "interview_name": formData?.interview_name || 'Not Available',
    //   "interview_time": formData?.interview_time || 'Not Available',
    //   "company_logo": formData?.company_logo || 'Not Available',
    //   "company": formData?.company || 'Not Available',
    //   "status": formData?.status || 'Not Available',
    //   "interview_type": formData?.interview_type || 'Not Available',
    //   "duration": formData?.duration || 'Not Available',
    //   "position": formData?.position || formData?.interview_name || 'Not Available',
    //   "location": formData?.location || 'Not Available',
    //   "interview_style": formData?.interview_style || 'Not Available',
    //   "job_description": formData?.job_description || 'Not Available',
    //   "interview_link": formData?.interview_link || 'Not Available',
    //   "expiry_date": formData?.expiry_date ||  "2027-06-15T23:59:59Z",
    //   "user_id": userId,
    //   "difficulty_level": formData?.difficulty_level || 'Not Available',
    //   "experience": formData?.experience || 'Not Available',
    //   "questions": questions || 'Not Available',
    // }


    // 5. Insert interview data 
    const interview = new Interview({
      interview_name: formData?.interview_name || 'Not Available',
      interview_time: formData?.interview_time || 'Not Available',
      company_logo: formData?.company_logo || 'Not Available',
      company: formData?.company || 'Not Available',
      status: formData?.status || 'Not Available',
      interview_type: formData?.interview_type || 'Not Available',
      duration: (formData?.duration * 60) || 1800,
      position: formData?.position || formData?.interview_name || 'Not Available',
      location: formData?.location || 'Not Available',
      interview_style: formData?.interview_style || 'Not Available',
      job_description: formData?.job_description || 'Not Available',
      interview_link: formData?.interview_link || 'Not Available',
      expiry_date: formData?.expiry_date || new Date('2030-06-15T23:59:59Z'),
      user_id: userId,
      difficulty_level: formData?.difficulty_level || 'Not Available',
      experience: formData?.experience || 'Not Available',
      questions: questions || 'Not Available',
      type: formData?.type || 'INTERVIEW',
      college_interview: college_interview_data || null
    });

    const savedInterview = await interview.save();

    // 6. Success - Include both _id and id for frontend compatibility
    const responseData = {
      ...savedInterview.toObject(),
      id: savedInterview._id.toString()
    };
    
    console.log('🎯 Interview created successfully with ID:', responseData.id);
    console.log('📊 MongoDB _id:', savedInterview._id);
    console.log('📊 String ID:', savedInterview._id.toString());
    console.log('📤 Full response data being sent:');
    console.log('   - state:', true);
    console.log('   - data.id:', responseData.id);
    console.log('   - data._id:', responseData._id);
    console.log('   - message:', 'Interview created');
    
    return NextResponse.json({ state: true, data: responseData, message: 'Interview created' }, { status: 201 });
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ state: false, error: 'Server Error', message: 'Something went wrong' }, { status: 500 });
  }
}

