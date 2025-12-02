import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route.js";
import crypto from "crypto";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      packageDetails,
    } = await req.json();

    // Verify payment signature
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature !== expectedSign) {
      return NextResponse.json(
        { message: "Invalid payment signature" },
        { status: 400 }
      );
    }

    // Payment verified successfully, now update user package
    const { MongoClient } = await import("mongodb");
    const client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db();
    const users = db.collection("users");

    const currentDate = new Date();
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + packageDetails.validityDays);

    // Update user with new package
    const result = await users.updateOne(
      { email: session.user.email },
      {
        $set: {
          isNewUser: false,
          package: {
            name: packageDetails.packageName,
            contactLimit: packageDetails.contactLimit,
            contactsUsed: 0,
            purchaseDate: currentDate,
            expiryDate: expiryDate,
            validityDays: packageDetails.validityDays,
            price: packageDetails.price,
            status: "active",
            paymentId: razorpay_payment_id,
            orderId: razorpay_order_id,
          },
          updatedAt: currentDate,
        },
        $push: {
          packageHistory: {
            name: packageDetails.packageName,
            contactLimit: packageDetails.contactLimit,
            purchaseDate: currentDate,
            expiryDate: expiryDate,
            validityDays: packageDetails.validityDays,
            price: packageDetails.price,
            paymentId: razorpay_payment_id,
            orderId: razorpay_order_id,
          },
        },
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
      {
        message: "Payment verified and package activated successfully",
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { message: "Payment verification failed", error: error.message },
      { status: 500 }
    );
  }
}
