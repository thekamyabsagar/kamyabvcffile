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
          return { 
            id: user._id.toString(), 
            email: user.email,
            username: user.username,
            country: user.country,
            phoneNumber: user.phoneNumber,
            companyName: user.companyName,
            isProfileComplete: user.isProfileComplete || true
          };
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
    async signIn({ user, account, profile }) {
      if (account.provider === "google") {
        try {
          const client = await MongoClient.connect(process.env.MONGODB_URI);
          const users = client.db().collection("users");
          
          const existingUser = await users.findOne({ email: user.email });
          
          if (!existingUser) {
            // Create user record for Google OAuth user without profile completion
            await users.insertOne({
              email: user.email,
              name: user.name,
              image: user.image,
              provider: "google",
              isProfileComplete: false,
              createdAt: new Date(),
            });
          }
          
          await client.close();
        } catch (error) {
          console.error("Error handling Google sign in:", error);
        }
      }
      return true;
    },
    async redirect({ url, baseUrl }) {
      // Check if user needs to complete profile after Google OAuth
      if (url === baseUrl || url === `${baseUrl}/`) {
        try {
          const client = await MongoClient.connect(process.env.MONGODB_URI);
          const users = client.db().collection("users");
          
          // This is a bit tricky - we need the user's email, but it's not available in redirect callback
          // We'll handle this in the session callback instead
          await client.close();
        } catch (error) {
          console.error("Error in redirect callback:", error);
        }
      }
      
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
    async session({ session, token, trigger, newSession }) {
      // Handle session updates (when update() is called from client)
      if (trigger === "update" && newSession?.user) {
        session.user = { ...session.user, ...newSession.user };
        return session;
      }
      
      if (session?.user?.email) {
        try {
          const client = await MongoClient.connect(process.env.MONGODB_URI);
          const users = client.db().collection("users");
          
          const user = await users.findOne({ email: session.user.email });
          if (user) {
            session.user.isProfileComplete = user.isProfileComplete || false;
            session.user.username = user.username;
            session.user.country = user.country;
            session.user.phoneNumber = user.phoneNumber;
            session.user.companyName = user.companyName;
          }
          
          await client.close();
        } catch (error) {
          console.error("Error in session callback:", error);
        }
      }
      return session;
    },
    async jwt({ token, account, user, trigger, session }) {
      if (account) {
        token.provider = account.provider;
      }
      // Handle session updates
      if (trigger === "update" && session?.user) {
        token = { ...token, ...session.user };
      }
      return token;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };