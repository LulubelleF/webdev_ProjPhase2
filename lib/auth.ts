import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "bcrypt"
import prisma from "@/lib/prisma"
import type { NextAuthOptions } from "next-auth"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"

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
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  events: {
    async signOut({ token }) {
      // You can add any additional cleanup here if needed
      console.log("User signed out:", token)
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}

export async function getSession() {
  return await getServerSession(authOptions)
}

export async function getCurrentUser() {
  const session = await getSession()

  if (!session?.user) {
    return null
  }

  return session.user
}

export async function requireAuth() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/")
  }

  return user
}

export async function requireRole(allowedRoles: string[]) {
  const user = await requireAuth()

  if (!allowedRoles.includes(user.role)) {
    redirect("/dashboard")
  }

  return user
}

