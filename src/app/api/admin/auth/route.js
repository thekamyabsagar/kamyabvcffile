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

// GET - Check if current user is admin
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ isAdmin: false }, { status: 401 });
    }

    const adminStatus = await isAdmin(session.user.email);
    
    return NextResponse.json({ isAdmin: adminStatus });
  } catch (error) {
    console.error("Error checking admin status:", error);
    return NextResponse.json(
      { error: "Failed to check admin status" },
      { status: 500 }
    );
  }
}
