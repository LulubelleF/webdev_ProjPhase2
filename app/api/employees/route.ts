import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { v4 as uuidv4 } from "uuid"

// GET - Fetch all employees with optional filtering
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get query parameters for filtering
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get("search") || ""
    const department = searchParams.get("department")
    const status = searchParams.get("status")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    // Build filter conditions
    const where: any = {}

    // Search by name or employee ID
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { employeeId: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ]
    }

    // Filter by department
    if (department && department !== "all") {
      where.department = department
    }

    // Filter by status
    if (status && status !== "all") {
      where.employmentStatus = status
    }

    // Get total count for pagination
    const totalCount = await prisma.employee.count({ where })

    // Get employees with pagination
    const employees = await prisma.employee.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({
      employees,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching employees:", error)
    return NextResponse.json({ error: "Failed to fetch employees" }, { status: 500 })
  }
}

// POST - Create a new employee
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()

    // Validate required fields
    const requiredFields = ["firstName", "lastName", "email", "dateOfBirth", "department", "jobTitle", "hireDate"]

    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          {
            error: `Missing required field: ${field}`,
          },
          { status: 400 },
        )
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.email)) {
      return NextResponse.json(
        {
          error: "Invalid email format",
        },
        { status: 400 },
      )
    }

    // Validate work email if provided
    if (data.workEmail && !emailRegex.test(data.workEmail)) {
      return NextResponse.json(
        {
          error: "Invalid work email format",
        },
        { status: 400 },
      )
    }

    // Validate dates
    try {
      const dateOfBirth = new Date(data.dateOfBirth)
      const hireDate = new Date(data.hireDate)

      // Check if dates are valid
      if (isNaN(dateOfBirth.getTime()) || isNaN(hireDate.getTime())) {
        return NextResponse.json(
          {
            error: "Invalid date format",
          },
          { status: 400 },
        )
      }

      // Check if date of birth is in the future
      if (dateOfBirth > new Date()) {
        return NextResponse.json(
          {
            error: "Date of birth cannot be in the future",
          },
          { status: 400 },
        )
      }

      // Check if hire date is too far in the future (more than 1 year)
      const maxFutureDate = new Date()
      maxFutureDate.setFullYear(maxFutureDate.getFullYear() + 1)
      if (hireDate > maxFutureDate) {
        return NextResponse.json(
          {
            error: "Hire date cannot be more than 1 year in the future",
          },
          { status: 400 },
        )
      }
    } catch (error) {
      return NextResponse.json(
        {
          error: "Invalid date format",
        },
        { status: 400 },
      )
    }

    // Generate a unique employee ID
    const employeeId = `EMP${Math.floor(1000 + Math.random() * 9000)}`

    // Create the employee
    const employee = await prisma.employee.create({
      data: {
        employeeId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber || "",
        dateOfBirth: new Date(data.dateOfBirth),

        // Address
        street: data.street || "",
        city: data.city || "",
        state: data.state || "",
        postalCode: data.postalCode || "",
        country: data.country || "",

        // Emergency contact
        emergencyName: data.emergencyName || "",
        emergencyRelationship: data.emergencyRelationship || "",
        emergencyPhoneNumber: data.emergencyPhoneNumber || "",

        // Employment Info
        department: data.department,
        jobTitle: data.jobTitle,
        employmentType: data.employmentType || "Full-time",
        hireDate: new Date(data.hireDate),
        currentSalary: data.currentSalary ? Number(data.currentSalary) : 0,
        reportingManagerId: data.reportingManagerId || "",
        workLocation: data.workLocation || "",
        workEmail: data.workEmail || "",
        workPhone: data.workPhone || "",
        employmentStatus: data.employmentStatus || "Active",

        // Metadata
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: session.user.userId,
        updatedBy: session.user.userId,
      },
    })

    // Create audit log for the creation
    await createAuditLog({
      employeeId: employee.id,
      action: "CREATE",
      oldValues: {},
      newValues: {
        ...data,
        employeeId,
        dateOfBirth: new Date(data.dateOfBirth),
        hireDate: new Date(data.hireDate),
        currentSalary: data.currentSalary ? Number(data.currentSalary) : 0,
      },
      editorUserId: session.user.id,
      editorUsername: session.user.username,
    })

    return NextResponse.json(employee, { status: 201 })
  } catch (error) {
    console.error("Error creating employee:", error)
    return NextResponse.json({ error: "Failed to create employee" }, { status: 500 })
  }
}

// Helper function to create audit logs
async function createAuditLog({
  employeeId,
  action,
  oldValues,
  newValues,
  editorUserId,
  editorUsername,
}: {
  employeeId: string
  action: string
  oldValues: any
  newValues: any
  editorUserId: string
  editorUsername: string
}) {
  // Determine which attributes were edited
  const attributesEdited = Object.keys(newValues).filter(
    (key) => JSON.stringify(oldValues[key]) !== JSON.stringify(newValues[key]),
  )

  // For CREATE actions, all fields are considered new
  const finalAttributesEdited = action === "CREATE" ? Object.keys(newValues) : attributesEdited

  return prisma.auditLog.create({
    data: {
      logId: uuidv4(),
      employeeId,
      dateOfUpdate: new Date(),
      timestamp: new Date(),
      attributesEdited: finalAttributesEdited,
      oldValues: oldValues,
      newValues: newValues,
      editorUsername,
      editorUserId,
      actionType: action,
    },
  })
}

