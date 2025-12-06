import { getCollection } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { NextResponse } from "next/server";

// Helper function to check if user is admin
async function isAdmin(email) {
  const users = await getCollection("users");
  const user = await users.findOne({ email });
  return user?.role === "admin";
}

// GET - Fetch all users with their stats
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const adminStatus = await isAdmin(session.user.email);
    if (!adminStatus) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const users = await getCollection("users");

    // Fetch all users
    const allUsers = await users.find({}).toArray();

    // Map users with their package data
    const usersWithStats = allUsers.map((user) => {
      const userPackage = user.package;
      
      return {
        id: user._id.toString(),
        email: user.email,
        username: user.username || null,
        phoneNumber: user.phoneNumber || null,
        country: user.country || null,
        companyName: user.companyName || null,
        role: user.role || "user",
        isProfileComplete: user.isProfileComplete || false,
        createdAt: user.createdAt,
        packageName: userPackage?.name || null,
        contactsUsed: userPackage?.contactsUsed || 0,
        contactLimit: userPackage?.contactLimit || 0,
        packageStatus: userPackage?.status || "no-package",
        expiryDate: userPackage?.expiryDate || null,
      };
    });

    // Calculate stats
    const stats = {
      totalUsers: allUsers.length,
      totalAdmins: allUsers.filter(u => u.role === "admin").length,
      activePackages: usersWithStats.filter(u => u.packageStatus === "active").length,
      totalContactsUsed: usersWithStats.reduce((sum, u) => sum + u.contactsUsed, 0),
    };

    return NextResponse.json({ users: usersWithStats, stats });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// POST - Assign/Remove admin role
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const adminStatus = await isAdmin(session.user.email);
    if (!adminStatus) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { userId, role } = await request.json();

    if (!userId || !role) {
      return NextResponse.json(
        { error: "User ID and role are required" },
        { status: 400 }
      );
    }

    if (role !== "admin" && role !== "user") {
      return NextResponse.json(
        { error: "Invalid role. Must be 'admin' or 'user'" },
        { status: 400 }
      );
    }

    const users = await getCollection("users");
    const { ObjectId } = require("mongodb");

    // Update user role
    const result = await users.updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          role,
          updatedAt: new Date()
        } 
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: `User role updated to ${role}`
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json(
      { error: "Failed to update user role" },
      { status: 500 }
    );
  }
}

// DELETE - Delete user
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const adminStatus = await isAdmin(session.user.email);
    if (!adminStatus) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const users = await getCollection("users");
    const packages = await getCollection("packages");
    const { ObjectId } = require("mongodb");

    // Don't allow deleting yourself
    const userToDelete = await users.findOne({ _id: new ObjectId(userId) });
    if (userToDelete?.email === session.user.email) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    // Delete user and their package
    await users.deleteOne({ _id: new ObjectId(userId) });
    await packages.deleteOne({ userId });

    return NextResponse.json({ 
      success: true,
      message: "User deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
