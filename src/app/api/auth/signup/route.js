import { MongoClient } from "mongodb";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { email, password, username, country, phoneNumber, companyName } = await req.json();
    
    if (!email || !password || !username || !country || !phoneNumber || !companyName) {
      return NextResponse.json(
        { message: "All fields are required: email, password, username, country, phone number, and company name" },
        { status: 400 }
      );
    }

    const client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db();
    const users = db.collection("users");

    // Check if user already exists
    const existingUser = await users.findOne({ 
      $or: [{ email }, { username }] 
    });
    if (existingUser) {
      await client.close();
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

    await client.close();
    return NextResponse.json(
      { message: "User created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}