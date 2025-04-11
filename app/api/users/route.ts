import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { hash } from "bcrypt";
import { RoleLevel } from "@prisma/client";

// GET - Fetch all users with optional filtering
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only ADMIN and HR can list users
    if (session.user.role !== "ADMIN" && session.user.role !== "HR") {
      return NextResponse.json(
        { error: "Forbidden: Insufficient permissions" },
        { status: 403 }
      );
    }

    // Get query parameters for filtering
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role");
    const status = searchParams.get("status");
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Build filter conditions
    const where: any = {};

    // Search by username, fullName, email, or userId
    if (search) {
      where.OR = [
        { username: { contains: search, mode: "insensitive" } },
        { fullName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { userId: { contains: search, mode: "insensitive" } },
      ];
    }

    // Filter by role
    if (role && role !== "all") {
      where.roleLevel = role;
    }

    // Filter by status
    if (status === "active") {
      where.activeStatus = true;
    } else if (status === "inactive") {
      where.activeStatus = false;
    }

    // Get total count for pagination
    const totalCount = await prisma.user.count({ where });

    // Get users with pagination, excluding password
    const users = await prisma.user.findMany({
      where,
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
        password: false,
      },
      skip,
      take: limit,
      orderBy: { dateCreated: "desc" },
    });

    return NextResponse.json({
      users,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// POST - Create a new user
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only ADMIN can create users
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Only administrators can create user accounts" },
        { status: 403 }
      );
    }

    const data = await request.json();

    // Validate required fields
    const requiredFields = [
      "username",
      "password",
      "email",
      "fullName",
      "roleLevel",
    ];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate username format (alphanumeric and underscore only)
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(data.username)) {
      return NextResponse.json(
        {
          error: "Username can only contain letters, numbers, and underscores",
        },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existingUsername = await prisma.user.findUnique({
      where: { username: data.username },
    });
    if (existingUsername) {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingEmail = await prisma.user.findFirst({
      where: { email: data.email },
    });
    if (existingEmail) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      );
    }

    // Validate password strength
    if (data.password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Validate role level
    if (!Object.values(RoleLevel).includes(data.roleLevel)) {
      return NextResponse.json(
        { error: "Invalid role level" },
        { status: 400 }
      );
    }

    // Generate a unique user ID
    const userId = `USER${Math.floor(1000 + Math.random() * 9000)}`;

    // Hash the password
    const hashedPassword = await hash(data.password, 10);

    // Create the user
    const user = await prisma.user.create({
      data: {
        userId,
        username: data.username,
        password: hashedPassword,
        email: data.email,
        fullName: data.fullName,
        roleLevel: data.roleLevel,
        dateCreated: new Date(),
        lastLogin: new Date(),
        activeStatus:
          data.activeStatus !== undefined ? data.activeStatus : true,
        createdBy: session.user.userId,
      },
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
        password: false,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
