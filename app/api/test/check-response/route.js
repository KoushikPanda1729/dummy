import { NextResponse } from 'next/server';

export async function GET() {
  const testData = {
    _id: "67c4b5d8f9e123456789abcd",
    interview_name: "Test Interview",
    user_id: "user_123",
    status: "active"
  };

  const responseData = {
    ...testData,
    id: testData._id.toString()
  };

  console.log('🧪 Test response data:', responseData);

  return NextResponse.json({ 
    state: true, 
    data: responseData, 
    message: 'Test response' 
  }, { status: 200 });
}