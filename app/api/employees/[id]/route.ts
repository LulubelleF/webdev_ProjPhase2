import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { v4 as uuidv4 } from "uuid";

// GET - Fetch a specific employee by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const employee = await prisma.employee.findUnique({
      where: { id },
    });

    if (!employee) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(employee);
  } catch (error) {
    console.error("Error fetching employee:", error);
    return NextResponse.json(
      { error: "Failed to fetch employee" },
      { status: 500 }
    );
  }
}

// PUT - Update an employee
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the id directly from params (no need to await)
    const { id } = await params;
    const data = await request.json();

    // Check if employee exists and get current data for audit log
    const currentEmployee = await prisma.employee.findUnique({
      where: { id },
    });

    if (!currentEmployee) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }

    // Prepare the update data
    const updateData: any = {};

    // Only update fields that are provided and have changed
    if (
      data.firstName !== undefined &&
      data.firstName !== currentEmployee.firstName
    )
      updateData.firstName = data.firstName;
    if (
      data.lastName !== undefined &&
      data.lastName !== currentEmployee.lastName
    )
      updateData.lastName = data.lastName;
    if (data.email !== undefined && data.email !== currentEmployee.email)
      updateData.email = data.email;
    if (
      data.phoneNumber !== undefined &&
      data.phoneNumber !== currentEmployee.phoneNumber
    )
      updateData.phoneNumber = data.phoneNumber;

    // Address
    if (data.street !== undefined && data.street !== currentEmployee.street)
      updateData.street = data.street;
    if (data.city !== undefined && data.city !== currentEmployee.city)
      updateData.city = data.city;
    if (data.state !== undefined && data.state !== currentEmployee.state)
      updateData.state = data.state;
    if (
      data.postalCode !== undefined &&
      data.postalCode !== currentEmployee.postalCode
    )
      updateData.postalCode = data.postalCode;
    if (data.country !== undefined && data.country !== currentEmployee.country)
      updateData.country = data.country;

    // Emergency contact
    if (
      data.emergencyName !== undefined &&
      data.emergencyName !== currentEmployee.emergencyName
    )
      updateData.emergencyName = data.emergencyName;
    if (
      data.emergencyRelationship !== undefined &&
      data.emergencyRelationship !== currentEmployee.emergencyRelationship
    )
      updateData.emergencyRelationship = data.emergencyRelationship;
    if (
      data.emergencyPhoneNumber !== undefined &&
      data.emergencyPhoneNumber !== currentEmployee.emergencyPhoneNumber
    )
      updateData.emergencyPhoneNumber = data.emergencyPhoneNumber;

    // Employment Info
    if (
      data.department !== undefined &&
      data.department !== currentEmployee.department
    )
      updateData.department = data.department;
    if (
      data.jobTitle !== undefined &&
      data.jobTitle !== currentEmployee.jobTitle
    )
      updateData.jobTitle = data.jobTitle;
    if (
      data.employmentType !== undefined &&
      data.employmentType !== currentEmployee.employmentType
    )
      updateData.employmentType = data.employmentType;

    // Handle currentSalary properly - only include if it's a valid number
    if (data.currentSalary !== undefined && data.currentSalary !== "") {
      const newSalary = Number.parseFloat(data.currentSalary);
      if (!isNaN(newSalary) && newSalary !== currentEmployee.currentSalary) {
        updateData.currentSalary = newSalary;
      }
    }

    if (
      data.reportingManagerId !== undefined &&
      data.reportingManagerId !== currentEmployee.reportingManagerId
    )
      updateData.reportingManagerId = data.reportingManagerId;
    if (
      data.workLocation !== undefined &&
      data.workLocation !== currentEmployee.workLocation
    )
      updateData.workLocation = data.workLocation;
    if (
      data.workEmail !== undefined &&
      data.workEmail !== currentEmployee.workEmail
    )
      updateData.workEmail = data.workEmail;
    if (
      data.workPhone !== undefined &&
      data.workPhone !== currentEmployee.workPhone
    )
      updateData.workPhone = data.workPhone;
    if (
      data.employmentStatus !== undefined &&
      data.employmentStatus !== currentEmployee.employmentStatus
    )
      updateData.employmentStatus = data.employmentStatus;

    // Date of birth and hire date are intentionally not included here as they cannot be changed once set

    // Always update metadata
    updateData.updatedAt = new Date();
    updateData.updatedBy = session.user.userId;

    // Only proceed with update if there are changes
    if (Object.keys(updateData).length <= 2) {
      // Only updatedAt and updatedBy
      return NextResponse.json({ message: "No changes detected" });
    }

    // Update the employee
    const updatedEmployee = await prisma.employee.update({
      where: { id },
      data: updateData,
    });

    // Create a copy of the current and updated employee for audit log
    const oldValues = { ...currentEmployee } as any;
    const newValues = { ...updatedEmployee } as any;

    // Format dates for audit log to ensure consistent comparison
    const formatDateForAudit = (date: Date | string | null): string => {
      if (!date) return "";
      const d = new Date(date);
      return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(
        2,
        "0"
      )}-${String(d.getUTCDate()).padStart(2, "0")}`;
    };

    // Convert dates to consistent format for comparison
    if (oldValues.dateOfBirth) {
      oldValues.dateOfBirth = formatDateForAudit(oldValues.dateOfBirth);
    }
    if (oldValues.hireDate) {
      oldValues.hireDate = formatDateForAudit(oldValues.hireDate);
    }

    if (newValues.dateOfBirth) {
      newValues.dateOfBirth = formatDateForAudit(newValues.dateOfBirth);
    }
    if (newValues.hireDate) {
      newValues.hireDate = formatDateForAudit(newValues.hireDate);
    }

    // Keep createdAt as ISO string for reference
    if (oldValues.createdAt) {
      oldValues.createdAt = new Date(oldValues.createdAt).toISOString();
    }
    if (newValues.createdAt) {
      newValues.createdAt = new Date(newValues.createdAt).toISOString();
    }

    // Remove updatedAt from both objects for audit log
    delete oldValues.updatedAt;
    delete newValues.updatedAt;
    delete oldValues.updatedBy;
    delete newValues.updatedBy;

    // Create audit log for the update
    await createAuditLog({
      employeeId: id,
      action: "UPDATE",
      oldValues,
      newValues,
      editorUserId: session.user.id,
      editorUsername: session.user.username,
    });

    return NextResponse.json(updatedEmployee);
  } catch (error) {
    console.error("Error updating employee:", error);
    return NextResponse.json(
      { error: "Failed to update employee" },
      { status: 500 }
    );
  }
}

// DELETE endpoint removed - employees cannot be deleted

// Helper function to create audit logs
async function createAuditLog({
  employeeId,
  action,
  oldValues,
  newValues,
  editorUserId,
  editorUsername,
}: {
  employeeId: string;
  action: string;
  oldValues: any;
  newValues: any;
  editorUserId: string;
  editorUsername: string;
}) {
  // Determine which attributes were edited
  const attributesEdited = Object.keys(newValues).filter(
    (key) => JSON.stringify(oldValues[key]) !== JSON.stringify(newValues[key])
  );

  // For DELETE actions, all fields in oldValues are considered deleted
  // For CREATE actions, all fields in newValues are considered new
  const finalAttributesEdited =
    action === "DELETE"
      ? Object.keys(oldValues)
      : action === "CREATE"
      ? Object.keys(newValues)
      : attributesEdited;

  // Filter out updatedAt from the attributes edited
  const filteredAttributes = finalAttributesEdited.filter(
    (attr) => attr !== "updatedAt" && attr !== "updatedBy"
  );

  // Only create audit log if there are changes
  if (
    filteredAttributes.length === 0 &&
    action !== "DELETE" &&
    action !== "CREATE"
  ) {
    console.log("No changes detected, skipping audit log creation");
    return null;
  }

  // Create the audit log
  return prisma.auditLog.create({
    data: {
      logId: uuidv4(),
      employeeId,
      dateOfUpdate: new Date(),
      timestamp: new Date(),
      attributesEdited: filteredAttributes,
      oldValues: oldValues,
      newValues: newValues,
      editorUsername,
      editorUserId,
      actionType: action,
    },
  });
}
