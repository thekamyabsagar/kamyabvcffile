import { getCollection } from "@/lib/mongodb";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";

// POST - Create admin account (one-time setup)
export async function POST() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || "admin@admin.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

    const users = await getCollection("users");
    
    // Check if admin already exists
    const existingAdmin = await users.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      return NextResponse.json({ 
        message: "Admin user already exists",
        email: adminEmail
      });
    }

    // Hash the password
    const hashedPassword = await hash(adminPassword, 12);

    // Create admin user
    await users.insertOne({
      email: adminEmail,
      username: "Admin",
      password: hashedPassword,
      role: "admin",
      isProfileComplete: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ 
      success: true,
      message: "Admin user created successfully",
      email: adminEmail
    });
  } catch (error) {
    console.error("Error creating admin user:", error);
    return NextResponse.json(
      { error: "Failed to create admin user" },
      { status: 500 }
    );
  }
}
