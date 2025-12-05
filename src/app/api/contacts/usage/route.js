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

    const { imageCount, cardType } = await req.json();
    
    if (!imageCount || !cardType) {
      return NextResponse.json(
        { message: "Image count and card type are required" },
        { status: 400 }
      );
    }

    // Validate imageCount is a positive number
    if (imageCount <= 0 || !Number.isInteger(imageCount)) {
      return NextResponse.json(
        { message: "Image count must be a positive integer" },
        { status: 400 }
      );
    }

    // Calculate contacts used based on card type
    // Single-sided: 1 image = 1 contact
    // Double-sided: 2 images = 1 contact
    let contactsToAdd = 0;
    if (cardType === "single") {
      contactsToAdd = imageCount;
    } else if (cardType === "double") {
      contactsToAdd = Math.ceil(imageCount / 2);
    } else {
      return NextResponse.json(
        { message: "Invalid card type. Must be 'single' or 'double'" },
        { status: 400 }
      );
    }

    const users = await getCollection("users");

    // Get current user package info
    const user = await users.findOne(
      { email: session.user.email },
      { projection: { package: 1 } }
    );

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Check if user has an active package
    if (!user.package) {
      return NextResponse.json(
        { message: "No active package found. Please select a package first." },
        { status: 403 }
      );
    }

    // Check if package has expired
    const now = new Date();
    const expiryDate = new Date(user.package.expiryDate);
    if (now > expiryDate) {
      return NextResponse.json(
        { message: "Your package has expired. Please purchase a new package." },
        { status: 403 }
      );
    }

    // Check if user has enough contacts remaining
    const contactsUsed = user.package.contactsUsed || 0;
    const contactLimit = user.package.contactLimit;
    const contactsRemaining = contactLimit - contactsUsed;

    if (contactsToAdd > contactsRemaining) {
      return NextResponse.json(
        { 
          message: `Insufficient contacts. You need ${contactsToAdd} contacts but only have ${contactsRemaining} remaining.`,
          contactsNeeded: contactsToAdd,
          contactsRemaining: contactsRemaining
        },
        { status: 403 }
      );
    }

    // Increment contacts used
    const result = await users.updateOne(
      { email: session.user.email },
      {
        $inc: {
          "package.contactsUsed": contactsToAdd
        },
        $set: {
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { message: "Failed to update contact usage" },
        { status: 500 }
      );
    }

    const newContactsUsed = contactsUsed + contactsToAdd;
    const newContactsRemaining = contactLimit - newContactsUsed;

    return NextResponse.json(
      { 
        message: "Contact usage updated successfully",
        contactsAdded: contactsToAdd,
        contactsUsed: newContactsUsed,
        contactLimit: contactLimit,
        contactsRemaining: newContactsRemaining
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Contact usage error:", error.message);
    return NextResponse.json(
      { message: "Failed to update contact usage" },
      { status: 500 }
    );
  }
}

// GET endpoint to check contact usage
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
      { projection: { package: 1 } }
    );

    if (!user || !user.package) {
      return NextResponse.json(
        { 
          message: "No package found",
          hasPackage: false,
          contactsUsed: 0,
          contactLimit: 0,
          contactsRemaining: 0,
          isExpired: false,
          isExhausted: false,
          status: "no-package"
        },
        { status: 200 }
      );
    }

    // Check if package has expired or contacts exhausted
    const now = new Date();
    const expiryDate = new Date(user.package.expiryDate);
    const isExpired = now > expiryDate;

    const contactsUsed = user.package.contactsUsed || 0;
    const contactLimit = user.package.contactLimit;
    const contactsRemaining = contactLimit - contactsUsed;
    const isExhausted = contactsRemaining <= 0;
    
    let status = "active";
    if (isExpired) {
      status = "expired";
    } else if (isExhausted) {
      status = "exhausted";
    }

    return NextResponse.json(
      { 
        packageName: user.package.name,
        contactsUsed: contactsUsed,
        contactLimit: contactLimit,
        contactsRemaining: contactsRemaining,
        expiryDate: user.package.expiryDate,
        isExpired: isExpired,
        isExhausted: isExhausted,
        status: status
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Contact usage fetch error:", error.message);
    return NextResponse.json(
      { message: "Failed to fetch contact usage" },
      { status: 500 }
    );
  }
}
