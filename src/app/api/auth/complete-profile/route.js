import { MongoClient } from "mongodb";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../[...nextauth]/route.js";

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

    const client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db();
    const users = db.collection("users");

    // Check if username is already taken
    const existingUser = await users.findOne({ username });
    if (existingUser && existingUser.email !== email) {
      await client.close();
      return NextResponse.json(
        { message: "Username already taken" },
        { status: 409 }
      );
    }

    // Update or create user profile with free trial package
    const currentDate = new Date();
    const trialExpiryDate = new Date();
    trialExpiryDate.setDate(trialExpiryDate.getDate() + 30); // 30 days free trial

    const result = await users.updateOne(
      { email },
      {
        $set: {
          username,
          country,
          phoneNumber,
          companyName,
          isProfileComplete: true,
          isNewUser: false,
          updatedAt: currentDate,
        },
        $setOnInsert: {
          email,
          createdAt: currentDate,
          isNewUser: true
        }
      },
      { upsert: true }
    );

    await client.close();

    return NextResponse.json(
      { message: "Profile completed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Profile completion error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}