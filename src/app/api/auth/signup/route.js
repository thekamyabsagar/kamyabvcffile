import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";

export async function POST(req) {
  try {
    const { email, password, username, country, phoneNumber, companyName } = await req.json();
    
    // Validate all required fields
    if (!email || !password || !username || !country || !phoneNumber || !companyName) {
      return NextResponse.json(
        { message: "All fields are required: email, password, username, country, phone number, and company name" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password strength (min 6 chars)
    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    // Validate username (alphanumeric and underscore only)
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
      return NextResponse.json(
        { message: "Username must be 3-20 characters and contain only letters, numbers, and underscores" },
        { status: 400 }
      );
    }

    const users = await getCollection("users");

    // Check if user already exists
    const existingUser = await users.findOne({ 
      $or: [{ email }, { username }] 
    });
    if (existingUser) {
      const message = existingUser.email === email ? "User with this email already exists" : "Username already taken";
      return NextResponse.json(
        { message },
        { status: 409 }
      );
    }

    // Hash password and create user - mark as new user
    const hashedPassword = await hash(password, 12);
    const currentDate = new Date();

    await users.insertOne({
      email,
      password: hashedPassword,
      username,
      country,
      phoneNumber,
      companyName,
      isProfileComplete: true,
      isNewUser: true,
      createdAt: currentDate,
    });

    return NextResponse.json(
      { message: "User created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error.message);
    return NextResponse.json(
      { message: "Failed to create user" },
      { status: 500 }
    );
  }
}