import { MongoClient } from "mongodb";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route.js";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db();
    const users = db.collection("users");

    const user = await users.findOne(
      { email: session.user.email },
      { projection: { password: 0 } } // Exclude password from response
    );

    await client.close();

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { username, country, phoneNumber, companyName } = await req.json();
    
    if (!username || !country || !phoneNumber || !companyName) {
      return NextResponse.json(
        { message: "All fields are required: username, country, phone number, and company name" },
        { status: 400 }
      );
    }

    const client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db();
    const users = db.collection("users");

    // Check if username is already taken by another user
    const existingUser = await users.findOne({ 
      username, 
      email: { $ne: session.user.email } 
    });
    
    if (existingUser) {
      await client.close();
      return NextResponse.json(
        { message: "Username already taken" },
        { status: 409 }
      );
    }

    // Update user profile
    const result = await users.updateOne(
      { email: session.user.email },
      {
        $set: {
          username,
          country,
          phoneNumber,
          companyName,
          isProfileComplete: true,
          updatedAt: new Date(),
        }
      }
    );

    await client.close();

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Profile updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}