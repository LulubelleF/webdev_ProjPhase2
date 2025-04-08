import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { RoleLevel } from "@prisma/client"

// GET - Fetch a specific user by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Await the params object to get the id
    const { id } = await params

    // Only ADMIN can view user details, or users can view their own details (removed HR)
    const isAdmin = session.user.role === "ADMIN"

    // First fetch the user to check if it's a self lookup
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const isSelfLookup = session.user.id === id

    if (!isAdmin && !isSelfLookup) {
      return NextResponse.json({ error: "Forbidden: Insufficient permissions" }, { status: 403 })
    }

    // Get the user details, excluding password
    const userDetails = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        username: true,
        email: true,
        fullName: true,
        roleLevel: true,
        dateCreated: true,
        lastLogin: true,
        activeStatus: true,
        createdBy: true,
        password: false, // Exclude password
      },
    })

    return NextResponse.json(userDetails)
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
  }
}

// PUT - Update a user
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Await the params object to get the id
    const { id } = await params
    const data = await request.json()

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        roleLevel: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Permission checks
    const isAdmin = session.user.role === "ADMIN"
    const isHR = session.user.role === "HR"
    const isSelf = session.user.id === id

    // Only admins can update roles
    if (data.roleLevel && !isAdmin) {
      return NextResponse.json({ error: "Only administrators can change role levels" }, { status: 403 })
    }

    // Only admins can update other admins
    if (user.roleLevel === "ADMIN" && !isAdmin) {
      return NextResponse.json({ error: "Only administrators can modify administrator accounts" }, { status: 403 })
    }

    // HR can update regular users but not admins
    if (isHR && !isSelf && user.roleLevel !== "USER") {
      return NextResponse.json({ error: "HR can only modify regular user accounts" }, { status: 403 })
    }

    // Regular users can only update their own non-sensitive information
    if (!isAdmin && !isHR && !isSelf) {
      return NextResponse.json({ error: "You can only update your own account" }, { status: 403 })
    }

    // Prepare update data
    const updateData: any = {}

    // Only allow certain fields to be updated
    if (data.fullName) updateData.fullName = data.fullName
    if (data.email) {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(data.email)) {
        return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
      }

      // Check if email is already in use by another user
      const existingEmail = await prisma.user.findFirst({
        where: {
          email: data.email,
          id: { not: id },
        },
      })

      if (existingEmail) {
        return NextResponse.json({ error: "Email already in use by another user" }, { status: 400 })
      }

      updateData.email = data.email
    }

    // Only admins and HR can update these fields
    if ((isAdmin || isHR) && data.activeStatus !== undefined) {
      updateData.activeStatus = data.activeStatus
    }

    // Only admins can update role level
    if (isAdmin && data.roleLevel) {
      if (!Object.values(RoleLevel).includes(data.roleLevel)) {
        return NextResponse.json({ error: "Invalid role level" }, { status: 400 })
      }
      updateData.roleLevel = data.roleLevel
    }

    // Update the user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        userId: true,
        username: true,
        email: true,
        fullName: true,
        roleLevel: true,
        dateCreated: true,
        lastLogin: true,
        activeStatus: true,
        createdBy: true,
        password: false, // Exclude password
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}

