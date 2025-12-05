import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route.js";
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

    const users = await getCollection("users");

    const currentDate = new Date();
    const trialExpiryDate = new Date();
    trialExpiryDate.setDate(trialExpiryDate.getDate() + 30); // 30 days free trial

    // Update user with free trial package and mark as not new user
    const result = await users.updateOne(
      { email: session.user.email },
      {
        $set: {
          isNewUser: false,
          package: {
            name: "Free Trial",
            contactLimit: 100,
            contactsUsed: 0,
            purchaseDate: currentDate,
            expiryDate: trialExpiryDate,
            validityDays: 30,
            price: 0,
            status: "active"
          },
          updatedAt: currentDate,
        },
        $push: {
          packageHistory: {
            name: "Free Trial",
            contactLimit: 100,
            purchaseDate: currentDate,
            expiryDate: trialExpiryDate,
            validityDays: 30,
            price: 0
          }
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
      { 
        message: "Free trial activated successfully",
        success: true
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Free trial activation error:", error.message);
    return NextResponse.json(
      { message: "Failed to activate free trial" },
      { status: 500 }
    );
  }
}
