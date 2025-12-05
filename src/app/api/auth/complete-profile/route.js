import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../[...nextauth]/route.js";
import { getCollection } from "@/lib/mongodb";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { email, username, country, phoneNumber, companyName } = await req.json();
    
    if (!username || !country || !phoneNumber || !companyName) {
      return NextResponse.json(
        { message: "All fields are required: username, country, phone number, and company name" },
        { status: 400 }
      );
    }

    // Validate username
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
      return NextResponse.json(
        { message: "Username must be 3-20 characters and contain only letters, numbers, and underscores" },
        { status: 400 }
      );
    }

    const users = await getCollection("users");

    // Check if username is already taken
    const existingUser = await users.findOne({ username });
    if (existingUser && existingUser.email !== email) {
      return NextResponse.json(
        { message: "Username already taken" },
        { status: 409 }
      );
    }

    // Update or create user profile with free trial package
    const currentDate = new Date();

    const result = await users.updateOne(
      { email },
      {
        $set: {
          username,
          country,
          phoneNumber,
          companyName,
          isProfileComplete: true,
          updatedAt: currentDate,
        },
        $setOnInsert: {
          email,
          createdAt: currentDate,
        }
      },
      { upsert: true }
    );

    return NextResponse.json(
      { message: "Profile completed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Profile completion error:", error.message);
    return NextResponse.json(
      { message: "Failed to complete profile" },
      { status: 500 }
    );
  }
}