import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route.js";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { amount, packageName, contactLimit, validityDays } = await req.json();
    if (!amount || !packageName) {
      return NextResponse.json(
        { message: "Amount and package name are required" },
        { status: 400 }
      );
    }

    // Calculate amount with 18% tax
    const taxRate = 0.18;
    const amountWithTax = Math.round((amount + amount * taxRate) * 100); // in paise

    // Import Razorpay dynamically
    const Razorpay = (await import("razorpay")).default;
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    // Create order with Razorpay
    const options = {
      amount: amountWithTax, // Razorpay expects amount in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        packageName: packageName,
        contactLimit: contactLimit,
        validityDays: validityDays,
        userEmail: session.user.email,
        baseAmount: amount,
        taxAmount: amount * taxRate,
      },
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json(
      {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
        baseAmount: amount,
        taxAmount: amount * taxRate,
        totalAmount: (amount + amount * taxRate),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    return NextResponse.json(
      { message: "Failed to create payment order", error: error.message },
      { status: 500 }
    );
  }
}
