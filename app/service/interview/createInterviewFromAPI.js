/**
 * Service for handling create interview API calls
 */


export default async function createInterviewFromAPI(formData, questions, college_interview_data) {
  const input = {
    formData: formData,
    questions: questions,
    college_interview_data
  }
  console.log("create interview data", input)

  try { 
    const response = await fetch(`/api/interview/create-interview`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });


    if (!response.ok) {
      return {
        state: false,
        error: `Failed to create Interview`,
        message: 'Response Error fetchInterviewReport',
      }
    }

    const result = await response.json();

    console.log('📨 Frontend received response from create-interview API:');
    console.log('   - result.state:', result?.state);
    console.log('   - result.data:', result?.data);
    console.log('   - result.data.id:', result?.data?.id);
    console.log('   - result.data._id:', result?.data?._id);
    console.log('   - result.message:', result?.message);

    if (!result?.data) {
      console.log('❌ No data in response, returning failure');
      return {
        state: false,
        error: 'Failed to create Interview',
        message: 'Failed',
      };
    }

    console.log('✅ Frontend returning success with data.id:', result.data.id);
    return {
      state: true,
      data: result.data,
      message: result.message || 'Success',
    }
  } catch (err) {
    console.error('Interview fetch error:', err); // Remove or replace with monitoring logger
    return {
      state: false,
      error: err.message || 'Something went wrong',
      message: 'Failed',
    };
  }

};



