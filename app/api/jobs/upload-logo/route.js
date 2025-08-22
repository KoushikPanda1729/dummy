import dbConnect from '@/lib/mongodb/mongoose';
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await dbConnect();
    
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const allowedTypes = ['image/png', 'image/jpeg'];
    const maxSize = 2 * 1024 * 1024; // ✅ 2MB

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large (max 2MB)' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64Data = buffer.toString('base64');
    const filename = `logos/${nanoid()}-${file.name}`;
    
    // For now, return a data URL. In production, you should use proper file storage
    // like AWS S3, Cloudinary, or similar service
    const dataUrl = `data:${file.type};base64,${base64Data}`;

    // TODO: Replace with proper file storage service
    console.log(`Logo uploaded: ${filename}, size: ${buffer.length} bytes`);

    return NextResponse.json({ url: dataUrl }, { status: 200 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
