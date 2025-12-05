import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route.js";
import { getCollection } from "@/lib/mongodb";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const users = await getCollection("users");

    const user = await users.findOne(
      { email: session.user.email },
      { projection: { password: 0 } } // Exclude password from response
    );

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("Profile fetch error:", error.message);
    return NextResponse.json(
      { message: "Failed to fetch profile" },
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

    // Validate username
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
      return NextResponse.json(
        { message: "Username must be 3-20 characters and contain only letters, numbers, and underscores" },
        { status: 400 }
      );
    }

    const users = await getCollection("users");

    // Check if username is already taken by another user
    const existingUser = await users.findOne({ 
      username, 
      email: { $ne: session.user.email } 
    });
    
    if (existingUser) {
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
    console.error("Profile update error:", error.message);
    return NextResponse.json(
      { message: "Failed to update profile" },
      { status: 500 }
    );
  }
}