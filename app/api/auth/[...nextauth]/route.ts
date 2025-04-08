import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "bcrypt"
import prisma from "@/lib/prisma"
import type { NextAuthOptions } from "next-auth"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        // Find user by username
        const user = await prisma.user.findUnique({
          where: {
            username: credentials.username,
          },
        })

        // If user doesn't exist or is inactive
        if (!user || !user.activeStatus) {
          return null
        }

        // Check password
        const isPasswordValid = await compare(credentials.password, user.password)

        if (!isPasswordValid) {
          return null
        }

        // Update last login time
        await prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            lastLogin: new Date(),
          },
        })

        // Return user object (without password)
        return {
          id: user.id,
          userId: user.userId,
          name: user.fullName,
          email: user.email,
          username: user.username,
          role: user.roleLevel,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.userId = user.userId
        token.username = user.username
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.userId = token.userId
        session.user.username = token.username
        session.user.role = token.role
      }
      return session
    },
  },
  pages: {
    signIn: "/", // Custom sign-in page (your login page)
    signOut: "/", // Redirect to login page after sign out
    error: "/", // Error page
  },
  session: {
    strategy: "jwt",
    maxAge: 600, // 10 minutes (changed from 30 seconds)
  },
  events: {
    async signOut({ token }) {
      // You can add any additional cleanup here if needed
      console.log("User signed out:", token)
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }

