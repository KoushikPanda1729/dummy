import { NextResponse } from "next/server";
import generateUuid from "@/lib/utils/generateUuid";
import dbConnect from "@/lib/mongodb/mongoose";
import User from "@/lib/mongodb/models/User";
import Usage from "@/lib/mongodb/models/Usage";

export async function POST(request) {
  try {
    const inputData = await request.json();
    console.log("📥 Incoming Data:", inputData);

    // --------------------------
    // 🧪 Validate required fields
    // --------------------------
    // Fix: Check for both clerk_id and id to handle both cases
    const clerkId = inputData.clerk_id || inputData.id;

    if (!clerkId || !inputData.email || !inputData.name) {
      console.error("❌ Missing required user fields:", {
        clerk_id: clerkId,
        email: inputData.email,
        name: inputData.name,
      });
      return NextResponse.json(
        {
          state: false,
          error: "Missing required fields",
          message: "clerk_id (or id), email, and name are required",
        },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await dbConnect();

    // ----------------------------
    // 1. Add user to 'users' collection
    // ----------------------------
    console.log("🚀 Inserting user into MongoDB...");
    try {
      const user = new User({
        clerk_id: clerkId,
        email: inputData.email || "no@email.com",
        first_name: inputData.name || "Unnamed User",
        last_name: inputData.username || "no-username",
        profile_image: inputData.img_url || "",
        usage_count: 0,
        subscription_status: 'inactive'
      });

      const userData = await user.save();

      // -----------------------------
      // 2. Add usage record for user
      // -----------------------------
      const usage = new Usage({
        user_id: clerkId,
        remaining_minutes: 300,
        last_reset: new Date(),
      });

      const usageData = await usage.save();

      // ✅ Success
      return NextResponse.json(
        {
          state: true,
          data: userData,
          message: "User and usage created successfully",
        },
        { status: 201 }
      );
    } catch (error) {
      console.error("🛑 MongoDB Insert Error:", error);
      return NextResponse.json(
        {
          state: false,
          error: error.message || "Unknown MongoDB error",
          message: "Failed to insert user or usage record",
        },
        { status: 500 }
      );
    }
  } catch (err) {
    console.error("🔥 Server Error:", err);
    return NextResponse.json(
      {
        state: false,
        error: err.message || "Unknown server error",
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

