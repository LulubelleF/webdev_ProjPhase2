// app/api/employees/route.ts (update the POST handler)

// POST - Create a new employee
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    // Validate required fields
    const requiredFields = [
      "firstName", "lastName", "email", "phoneNumber", "dateOfBirth",
      "department", "jobTitle", "employmentType", "hireDate", "currentSalary",
      "employmentStatus"
    ];

    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
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

    // Validate dates
    const today = new Date();
    const dateOfBirth = new Date(data.dateOfBirth);
    if (dateOfBirth > today) {
      return NextResponse.json(
        { error: "Date of birth cannot be in the future" },
        { status: 400 }
      );
    }

    const hireDate = new Date(data.hireDate);
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 1);
    if (hireDate > maxDate) {
      return NextResponse.json(
        { error: "Hire date cannot be more than 1 year in the future" },
        { status: 400 }
      );
    }

    // Generate a unique employee ID
    const employeeId = `EMP${Math.floor(1000 + Math.random() * 9000)}`;

    // Create the employee
    const employee = await prisma.employee.create({
      data: {
        employeeId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber,
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
        employmentType: data.employmentType,
        hireDate: new Date(data.hireDate),
        currentSalary: parseFloat(data.currentSalary),
        reportingManagerId: data.reportingManagerId || "",
        workLocation: data.workLocation || "",
        workEmail: data.workEmail || "",
        workPhone: data.workPhone || "",
        employmentStatus: data.employmentStatus,

        // Metadata
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: session.user.userId,
        updatedBy: session.user.userId,
      },
    });

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
        currentSalary: parseFloat(data.currentSalary),
      },
      editorUserId: session.user.id,
      editorUsername: session.user.username,
    });

    return NextResponse.json(employee, { status: 201 });
  } catch (error) {
    console.error("Error creating employee:", error);
    return NextResponse.json(
      { error: "Failed to create employee" },
      { status: 500 }
    );
  }
}