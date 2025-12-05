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

    const { packageName, contactLimit, validityDays, price } = await req.json();
    
    if (!packageName || !contactLimit || !validityDays) {
      return NextResponse.json(
        { message: "Package details are required" },
        { status: 400 }
      );
    }

    const users = await getCollection("users");

    const currentDate = new Date();
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + validityDays);

    // Update user with new package
    const result = await users.updateOne(
      { email: session.user.email },
      {
        $set: {
          package: {
            name: packageName,
            contactLimit: contactLimit,
            contactsUsed: 0,
            purchaseDate: currentDate,
            expiryDate: expiryDate,
            validityDays: validityDays,
            price: price || 0,
            status: "active"
          },
          updatedAt: currentDate,
        },
        $push: {
          packageHistory: {
            name: packageName,
            contactLimit: contactLimit,
            purchaseDate: currentDate,
            expiryDate: expiryDate,
            validityDays: validityDays,
            price: price || 0
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
        message: "Package purchased successfully",
        package: {
          name: packageName,
          contactLimit: contactLimit,
          expiryDate: expiryDate,
          validityDays: validityDays
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Package purchase error:", error.message);
    return NextResponse.json(
      { message: "Failed to purchase package" },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch current package details
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
      { projection: { package: 1, packageHistory: 1 } }
    );

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Check if package has expired or contacts exhausted
    if (user.package && user.package.expiryDate) {
      const now = new Date();
      const expiryDate = new Date(user.package.expiryDate);
      const contactsUsed = user.package.contactsUsed || 0;
      const contactsRemaining = user.package.contactLimit - contactsUsed;
      
      if (now > expiryDate) {
        user.package.status = "expired";
      } else if (contactsRemaining <= 0) {
        user.package.status = "exhausted";
      } else {
        user.package.status = "active";
      }
    }
    return NextResponse.json(
      { 
        currentPackage: user.package || null,
        packageHistory: user.packageHistory || [],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Package fetch error:", error.message);
    return NextResponse.json(
      { message: "Failed to fetch package details" },
      { status: 500 }
    );
  }
}
