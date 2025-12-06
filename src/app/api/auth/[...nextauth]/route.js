import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { compare } from "bcryptjs";
import { getCollection } from "@/lib/mongodb";

// Validate required environment variables
if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('NEXTAUTH_SECRET is required. Generate one with: openssl rand -base64 32');
}

if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI is required');
}

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Validate input
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        // Basic email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(credentials.email)) {
          throw new Error("Invalid email format");
        }

        try {
          const users = await getCollection("users");
          
          const user = await users.findOne({ email: credentials.email });
          if (!user) {
            throw new Error("Invalid credentials");
          }

          // Verify user has a password (not OAuth-only account)
          if (!user.password) {
            throw new Error("Please sign in with Google");
          }

          const isValid = await compare(credentials.password, user.password);
          if (!isValid) {
            throw new Error("Invalid credentials");
          }

          return { 
            id: user._id.toString(), 
            email: user.email,
            username: user.username || null,
            isProfileComplete: Boolean(user.isProfileComplete)
          };
        } catch (error) {
          console.error("Auth error:", error.message);
          throw new Error("Invalid credentials");
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
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account }) {
      if (account.provider === "google") {
        try {
          const users = await getCollection("users");
          
          // Use upsert pattern to create user if doesn't exist
          await users.updateOne(
            { email: user.email },
            {
              $setOnInsert: {
                email: user.email,
                name: user.name,
                image: user.image,
                provider: "google",
                isProfileComplete: false,
                createdAt: new Date(),
              }
            },
            { upsert: true }
          );
        } catch (error) {
          console.error("Error handling Google sign in:", error.message);
          return false;
        }
      }
      return true;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
    async session({ session, token }) {
      // Only include minimal necessary data in session
      if (session?.user && token?.sub) {
        session.user.id = token.sub;
        session.user.isProfileComplete = Boolean(token.isProfileComplete);
      }
      return session;
    },
    async jwt({ token, user, trigger, session }) {
      // On initial sign in, add user data to token
      if (user) {
        token.isProfileComplete = Boolean(user.isProfileComplete);
        token.username = user.username || null;
      }
      
      // Fetch fresh user data from database on each request to ensure profile status is up to date
      if (token?.email) {
        try {
          const users = await getCollection("users");
          const dbUser = await users.findOne({ email: token.email });
          
          if (dbUser) {
            token.isProfileComplete = Boolean(dbUser.isProfileComplete);
            token.username = dbUser.username || null;
          }
        } catch (error) {
          console.error("Error fetching user data in JWT callback:", error.message);
        }
      }
      
      // Handle session updates from client
      if (trigger === "update" && session?.user) {
        if (session.user.isProfileComplete !== undefined) {
          token.isProfileComplete = Boolean(session.user.isProfileComplete);
        }
        if (session.user.username !== undefined) {
          token.username = session.user.username;
        }
      }
      
      return token;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };