export default async function createNewUser(inputData) {
  console.log("input data from create user: ", inputData);
  try {
    // For development, use the actual running port or default
    const port = process.env.PORT || '3000';
    const baseUrl = process.env.NODE_ENV === 'development' 
      ? `http://localhost:${port}` 
      : process.env.NEXT_APP_HOSTNAME || 'https://dummy-pi-two.vercel.app';
      
    const response = await fetch(
      `${baseUrl}/api/user/create`,
      {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(inputData),
      }
    );
    const result = await response.json();

    if (!response.ok) {
      return {
        state: false,
        error: "Failed to create new user",
        message: "Error in Inserting Data in createNewUser",
      };
    }
    if (!result?.data) {
      return {
        state: false,
        error: "Failed to create new user",
        message: "No data",
      };
    }
    return {
      state: true,
      data: result.data,
      message: result.message || "Success",
    };
  } catch (err) {
    console.error("Interview fetch error:", err); // Remove or replace with monitoring logger
    return {
      state: false,
      error: err.message || "Something went wrong",
      message: "Failed",
    };
  }
}
