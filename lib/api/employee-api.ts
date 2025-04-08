// Types for employee data
export type Address = {
  street: string
  city: string
  state: string
  postalCode: string
  country: string
}

export type EmergencyContact = {
  name: string
  relationship: string
  phoneNumber: string
}

export type EmploymentInformation = {
  department: string
  jobTitle: string
  employmentType: string
  hireDate: Date | string
  currentSalary: number
  reportingManagerId: string
  workLocation: string
  workEmail: string
  workPhone: string
  employmentStatus: string
}

export type Employee = {
  id: string
  employeeId: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  dateOfBirth: Date | string

  // Address fields
  street: string
  city: string
  state: string
  postalCode: string
  country: string

  // Emergency contact fields
  emergencyName: string
  emergencyRelationship: string
  emergencyPhoneNumber: string

  // Employment information fields
  department: string
  jobTitle: string
  employmentType: string
  hireDate: Date | string
  currentSalary: number
  reportingManagerId: string
  workLocation: string
  workEmail: string
  workPhone: string
  employmentStatus: string

  // Metadata
  createdAt: Date | string
  updatedAt: Date | string
  createdBy: string
  updatedBy: string
}

export type AuditLog = {
  id: string
  logId: string
  employeeId: string
  dateOfUpdate: Date | string
  timestamp: Date | string
  attributesEdited: string[]
  oldValues: Record<string, any>
  newValues: Record<string, any>
  editorUsername: string
  editorUserId: string
  actionType: "CREATE" | "UPDATE" | "DELETE"
}

export type PaginatedResponse<T> = {
  data: T[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

// Function to fetch employees with optional filtering
export async function fetchEmployees(
  params: {
    search?: string
    department?: string
    status?: string
    page?: number
    limit?: number
  } = {},
): Promise<PaginatedResponse<Employee>> {
  const queryParams = new URLSearchParams()

  // Add any provided parameters to the query string
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      queryParams.append(key, value.toString())
    }
  })

  const response = await fetch(`/api/employees?${queryParams.toString()}`)

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || "Failed to fetch employees")
  }

  const data = await response.json()
  return {
    data: data.employees,
    pagination: data.pagination,
  }
}

// Function to fetch a single employee by ID
export async function fetchEmployeeById(id: string): Promise<Employee> {
  const response = await fetch(`/api/employees/${id}`)

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || "Failed to fetch employee")
  }

  return response.json()
}

// Function to fetch audit logs for an employee
export async function fetchEmployeeAuditLogs(id: string, page = 1, limit = 10): Promise<PaginatedResponse<AuditLog>> {
  const response = await fetch(`/api/employees/${id}/audit-logs?page=${page}&limit=${limit}`)

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || "Failed to fetch audit logs")
  }

  const data = await response.json()
  return {
    data: data.auditLogs,
    pagination: data.pagination,
  }
}

// Function to create a new employee
export async function createEmployee(data: Partial<Employee>): Promise<Employee> {
  const response = await fetch("/api/employees", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || "Failed to create employee")
  }

  return response.json()
}

// Function to update an employee
export async function updateEmployee(id: string, data: Partial<Employee>): Promise<Employee> {
  const response = await fetch(`/api/employees/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || "Failed to update employee")
  }

  return response.json()
}

// Delete function removed - employees cannot be deleted

