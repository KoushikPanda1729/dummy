import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb/mongoose';
import Resume from '@/lib/mongodb/models/Resume';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    const filename = params.filename;
    const resume = await Resume.findOne({ 
      file_url: { $regex: filename } 
    });

    if (!resume || !resume.file_content) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Convert base64 back to buffer
    const fileBuffer = Buffer.from(resume.file_content, 'base64');
    
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': resume.file_type,
        'Content-Disposition': `attachment; filename="${resume.file_name}"`,
      },
    });
  } catch (error) {
    console.error('Error serving file:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}