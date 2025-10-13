import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { MongoClient } from "mongodb";
import { compare } from "bcryptjs";

// Function to generate a random secret if none is provided
const generateSecret = () => {
  if (process.env.NEXTAUTH_SECRET) return process.env.NEXTAUTH_SECRET;
  const randomBytes = require('crypto').randomBytes(32);
  return randomBytes.toString('base64');
};

const secret = process.env.NEXTAUTH_SECRET || "your-secret-key-here-generate-with-openssl-rand-base64-32";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const client = await MongoClient.connect(process.env.MONGODB_URI);
          const users = client.db().collection("users");
          
          const user = await users.findOne({ email: credentials.email });
          if (!user) {
            throw new Error("No user found with this email");
          }

          const isValid = await compare(credentials.password, user.password);
          if (!isValid) {
            throw new Error("Invalid password");
          }

          await client.close();
          return { id: user._id.toString(), email: user.email };
        } catch (error) {
          console.error("Auth error:", error);
          throw error;
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: secret,
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };