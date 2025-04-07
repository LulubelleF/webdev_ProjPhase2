"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pencil, Save, X, Loader2, AlertCircle } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"
import { RainbowButton } from "@/components/ui/rainbow-button"
import { useSession } from "next-auth/react"
import { fetchEmployeeById, fetchEmployeeAuditLogs } from "@/lib/api/employee-api"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Define the employee type based on the provided schema
type Address = {
  street: string
  city: string
  state: string
  postalCode: string
  country: string
}

type EmergencyContact = {
  name: string
  relationship: string
  phoneNumber: string
}

type EmploymentInformation = {
  department: string
  jobTitle: string
  employmentType: string
  hireDate: Date
  currentSalary: number
  reportingManagerId: string
  employmentStatus: string
}

type Employee = {
  _id: string
  employeeId: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  dateOfBirth: Date
  address: Address
  emergencyContact: EmergencyContact
  employmentInformation: EmploymentInformation
  createdAt: Date
  updatedAt: Date
  createdBy: string
  updatedBy: string
}

// Define the audit log type based on the provided schema
type AuditLog = {
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

// Define props for the component
interface EmployeeDetailModalProps {
  employee: {
    id: string
    name: string
    department: string
    position: string
    status: string
  }
}

export default function EmployeeDetailModal({ employee }: EmployeeDetailModalProps) {
  // Get the user session to check permissions
  const { data: session } = useSession()
  const { toast } = useToast()

  // Check if user has permission to edit employees (ADMIN or HR)
  const canEditEmployee = session?.user?.role === "ADMIN" || session?.user?.role === "HR"

  // State for edit mode
  const [isEditing, setIsEditing] = useState(false)

  // State for modal open
  const [isOpen, setIsOpen] = useState(false)

  // State for active tab
  const [activeTab, setActiveTab] = useState("details")

  // State for employee data
  const [employeeData, setEmployeeData] = useState<any>(null)
  const [isLoadingEmployee, setIsLoadingEmployee] = useState(false)
  const [employeeError, setEmployeeError] = useState<string | null>(null)

  // State for audit logs
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [isLoadingAuditLogs, setIsLoadingAuditLogs] = useState(false)
  const [auditLogsError, setAuditLogsError] = useState<string | null>(null)

  // State for audit logs pagination
  const [auditLogsPagination, setAuditLogsPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    pages: 1,
  })

  // State for validation errors
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // In a real app, we would fetch the complete employee data
  const [nameParts, setNameParts] = useState(employee.name.split(" "))
  const firstName = nameParts[0]
  const lastName = nameParts.length > 1 ? nameParts[1] : ""

  // Fetch employee data when modal is opened
  useEffect(() => {
    if (isOpen) {
      fetchEmployeeDetails()
    }
  }, [isOpen])

  // Fetch audit logs when audit history tab is selected
  useEffect(() => {
    if (isOpen && activeTab === "history") {
      fetchAuditLogs()
    }
  }, [isOpen, activeTab])

  // Function to fetch employee details
  const fetchEmployeeDetails = async () => {
    setIsLoadingEmployee(true)
    setEmployeeError(null)

    try {
      const data = await fetchEmployeeById(employee.id)
      setEmployeeData(data)

      // Initialize form data with employee data
      setFormData({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber || "",
        dateOfBirth: data.dateOfBirth ? formatDate(new Date(data.dateOfBirth)) : "",
        street: data.street || "",
        city: data.city || "",
        state: data.state || "",
        postalCode: data.postalCode || "",
        country: data.country || "",
        emergencyContactName: data.emergencyName || "",
        emergencyContactRelationship: data.emergencyRelationship || "",
        emergencyContactPhoneNumber: data.emergencyPhoneNumber || "",
        department: data.department || "",
        jobTitle: data.jobTitle || "",
        employmentType: data.employmentType || "",
        hireDate: data.hireDate ? formatDate(new Date(data.hireDate)) : "",
        currentSalary: data.currentSalary ? data.currentSalary.toString() : "",
        reportingManagerId: data.reportingManagerId || "",
        employmentStatus: data.employmentStatus || "",
      })
    } catch (err: any) {
      console.error("Error fetching employee details:", err)
      setEmployeeError(err.message || "Failed to fetch employee details")
      toast({
        title: "Error",
        description: err.message || "Failed to fetch employee details",
        variant: "destructive",
      })
    } finally {
      setIsLoadingEmployee(false)
    }
  }

  // Function to fetch audit logs
  const fetchAuditLogs = async (page = 1) => {
    setIsLoadingAuditLogs(true)
    setAuditLogsError(null)

    try {
      const response = await fetchEmployeeAuditLogs(employee.id, page)
      setAuditLogs(response.data)
      setAuditLogsPagination(response.pagination)
    } catch (err: any) {
      console.error("Error fetching audit logs:", err)
      setAuditLogsError(err.message || "Failed to fetch audit logs")
      toast({
        title: "Error",
        description: err.message || "Failed to fetch audit logs",
        variant: "destructive",
      })
    } finally {
      setIsLoadingAuditLogs(false)
    }
  }

  // Format date for display
  const formatDate = (date: Date) => {
    return format(date, "yyyy-MM-dd")
  }

  // Handle opening manager's modal
  const openManagerModal = (managerId: string) => {
    // In a real app, this would open the manager's modal
    console.log(`Opening modal for manager ${managerId}`)
    alert(`This would open the modal for manager with ID: ${managerId}`)
  }

  // Toggle edit mode
  const toggleEditMode = () => {
    setIsEditing(!isEditing)
    // Clear validation errors when toggling edit mode
    setValidationErrors({})
  }

  // Validate form data
  const validateForm = () => {
    const errors: Record<string, string> = {}

    // Required fields
    if (!formData.firstName) errors.firstName = "First name is required"
    if (!formData.lastName) errors.lastName = "Last name is required"
    if (!formData.email) errors.email = "Email is required"
    if (!formData.dateOfBirth) errors.dateOfBirth = "Date of birth is required"
    if (!formData.department) errors.department = "Department is required"
    if (!formData.jobTitle) errors.jobTitle = "Job title is required"
    if (!formData.hireDate) errors.hireDate = "Hire date is required"

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address"
    }

    // Date validations
    if (formData.dateOfBirth) {
      const dob = new Date(formData.dateOfBirth)
      if (isNaN(dob.getTime())) {
        errors.dateOfBirth = "Invalid date format"
      } else if (dob > new Date()) {
        errors.dateOfBirth = "Date of birth cannot be in the future"
      }
    }

    if (formData.hireDate) {
      const hireDate = new Date(formData.hireDate)
      if (isNaN(hireDate.getTime())) {
        errors.hireDate = "Invalid date format"
      } else {
        const maxFutureDate = new Date()
        maxFutureDate.setFullYear(maxFutureDate.getFullYear() + 1)
        if (hireDate > maxFutureDate) {
          errors.hireDate = "Hire date cannot be more than 1 year in the future"
        }
      }
    }

    // Salary validation if provided
    if (formData.currentSalary && isNaN(Number.parseFloat(formData.currentSalary))) {
      errors.currentSalary = "Salary must be a valid number"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Save changes
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Update the saveChanges function to validate form and better handle dates and errors
  const saveChanges = async () => {
    if (!employeeData) return

    // Validate form before submission
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please correct the errors in the form",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Prepare the data for API
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        // Explicitly exclude dateOfBirth and hireDate from update data

        // Address
        street: formData.street,
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
        country: formData.country,

        // Emergency contact
        emergencyName: formData.emergencyContactName,
        emergencyRelationship: formData.emergencyContactRelationship,
        emergencyPhoneNumber: formData.emergencyContactPhoneNumber,

        // Employment Info
        department: formData.department,
        jobTitle: formData.jobTitle,
        employmentType: formData.employmentType,
        // Explicitly exclude hireDate from update data
        currentSalary: formData.currentSalary,
        reportingManagerId: formData.reportingManagerId,
        employmentStatus: formData.employmentStatus,
      }

      // Submit the update to the API
      const response = await fetch(`/api/employees/${employee.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update employee")
      }

      // Refresh employee data
      await fetchEmployeeDetails()

      // Exit edit mode
      setIsEditing(false)

      toast({
        title: "Success",
        description: "Employee updated successfully",
      })

      // Refresh audit logs if we're on that tab
      if (activeTab === "history") {
        fetchAuditLogs()
      }
    } catch (error: any) {
      console.error("Error updating employee:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update employee",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Form data state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    emergencyContactName: "",
    emergencyContactRelationship: "",
    emergencyContactPhoneNumber: "",
    department: "",
    jobTitle: "",
    employmentType: "",
    hireDate: "",
    currentSalary: "",
    reportingManagerId: "",
    employmentStatus: "",
  })

  // Handle input change
  const handleInputChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value,
    })

    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors({
        ...validationErrors,
        [field]: "",
      })
    }
  }

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Employee Details</DialogTitle>
          <DialogDescription>View and manage employee information</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details" onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-humane-blue/20 to-humane-purple/20">
            <TabsTrigger
              value="details"
              className="data-[state=active]:bg-white data-[state=active]:font-semibold data-[state=active]:border-b-2 data-[state=active]:border-humane-blue relative py-2"
            >
              Employee Details
              {activeTab === "details" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-rainbow" />
              )}
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="data-[state=active]:bg-white data-[state=active]:font-semibold data-[state=active]:border-b-2 data-[state=active]:border-humane-purple relative py-2"
            >
              Audit History
              {activeTab === "history" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-rainbow" />
              )}
            </TabsTrigger>
          </TabsList>

          {/* Employee Details Tab */}
          <TabsContent value="details" className="space-y-4">
            <div className="flex justify-end mb-2">
              {isEditing ? (
                <div className="space-x-2">
                  <Button variant="outline" onClick={toggleEditMode}>
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                  <RainbowButton onClick={saveChanges} disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </RainbowButton>
                </div>
              ) : (
                /* Only show Edit button for ADMIN and HR roles */
                canEditEmployee && (
                  <RainbowButton onClick={toggleEditMode}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </RainbowButton>
                )
              )}
            </div>

            {/* Display validation errors summary if any */}
            {isEditing && Object.keys(validationErrors).length > 0 && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please correct the following errors:
                  <ul className="list-disc pl-5 mt-2">
                    {Object.values(validationErrors).map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {isLoadingEmployee ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mr-2" />
                <span>Loading employee details...</span>
              </div>
            ) : employeeError ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{employeeError}</div>
            ) : employeeData ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/3">Field</TableHead>
                    <TableHead className="w-2/3">Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Personal Information Section */}
                  <TableRow className="bg-slate-100">
                    <TableCell colSpan={2} className="font-bold">
                      Personal Information
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Employee ID</TableCell>
                    <TableCell>{employeeData.employeeId}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      First Name <span className="text-red-500">*</span>
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <div className="space-y-1">
                          <Input
                            value={formData.firstName || ""}
                            onChange={(e) => handleInputChange("firstName", e.target.value)}
                            className={validationErrors.firstName ? "border-red-500" : ""}
                          />
                          {validationErrors.firstName && (
                            <p className="text-sm text-red-500">{validationErrors.firstName}</p>
                          )}
                        </div>
                      ) : (
                        employeeData.firstName
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      Last Name <span className="text-red-500">*</span>
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <div className="space-y-1">
                          <Input
                            value={formData.lastName || ""}
                            onChange={(e) => handleInputChange("lastName", e.target.value)}
                            className={validationErrors.lastName ? "border-red-500" : ""}
                          />
                          {validationErrors.lastName && (
                            <p className="text-sm text-red-500">{validationErrors.lastName}</p>
                          )}
                        </div>
                      ) : (
                        employeeData.lastName
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      Email <span className="text-red-500">*</span>
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <div className="space-y-1">
                          <Input
                            value={formData.email || ""}
                            onChange={(e) => handleInputChange("email", e.target.value)}
                            className={validationErrors.email ? "border-red-500" : ""}
                          />
                          {validationErrors.email && <p className="text-sm text-red-500">{validationErrors.email}</p>}
                        </div>
                      ) : (
                        employeeData.email
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Phone Number</TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={formData.phoneNumber || ""}
                          onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                        />
                      ) : (
                        employeeData.phoneNumber
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      Date of Birth <span className="text-red-500">*</span>
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <div className="space-y-1">
                          <Input
                            type="date"
                            value={formData.dateOfBirth || ""}
                            disabled={true}
                            className="bg-gray-100 cursor-not-allowed"
                          />
                          <p className="text-xs text-amber-600">Date of birth cannot be changed once set</p>
                        </div>
                      ) : (
                        employeeData.dateOfBirth && formatDate(new Date(employeeData.dateOfBirth))
                      )}
                    </TableCell>
                  </TableRow>

                  {/* Address Section */}
                  <TableRow className="bg-slate-100">
                    <TableCell colSpan={2} className="font-bold">
                      Address
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Street</TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={formData.street || ""}
                          onChange={(e) => handleInputChange("street", e.target.value)}
                        />
                      ) : (
                        employeeData.street
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>City</TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={formData.city || ""}
                          onChange={(e) => handleInputChange("city", e.target.value)}
                        />
                      ) : (
                        employeeData.city
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>State</TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={formData.state || ""}
                          onChange={(e) => handleInputChange("state", e.target.value)}
                        />
                      ) : (
                        employeeData.state
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Postal Code</TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={formData.postalCode || ""}
                          onChange={(e) => handleInputChange("postalCode", e.target.value)}
                        />
                      ) : (
                        employeeData.postalCode
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Country</TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={formData.country || ""}
                          onChange={(e) => handleInputChange("country", e.target.value)}
                        />
                      ) : (
                        employeeData.country
                      )}
                    </TableCell>
                  </TableRow>

                  {/* Emergency Contact Section */}
                  <TableRow className="bg-slate-100">
                    <TableCell colSpan={2} className="font-bold">
                      Emergency Contact
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={formData.emergencyContactName || ""}
                          onChange={(e) => handleInputChange("emergencyContactName", e.target.value)}
                        />
                      ) : (
                        employeeData.emergencyName
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Relationship</TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={formData.emergencyContactRelationship || ""}
                          onChange={(e) => handleInputChange("emergencyContactRelationship", e.target.value)}
                        />
                      ) : (
                        employeeData.emergencyRelationship
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Phone Number</TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={formData.emergencyContactPhoneNumber || ""}
                          onChange={(e) => handleInputChange("emergencyContactPhoneNumber", e.target.value)}
                        />
                      ) : (
                        employeeData.emergencyPhoneNumber
                      )}
                    </TableCell>
                  </TableRow>

                  {/* Employment Information Section */}
                  <TableRow className="bg-slate-100">
                    <TableCell colSpan={2} className="font-bold">
                      Employment Information
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      Department <span className="text-red-500">*</span>
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <div className="space-y-1">
                          <Select
                            value={formData.department || ""}
                            onValueChange={(value) => handleInputChange("department", value)}
                          >
                            <SelectTrigger className={validationErrors.department ? "border-red-500" : ""}>
                              <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Engineering">Engineering</SelectItem>
                              <SelectItem value="Marketing">Marketing</SelectItem>
                              <SelectItem value="HR">HR</SelectItem>
                              <SelectItem value="Finance">Finance</SelectItem>
                              <SelectItem value="Sales">Sales</SelectItem>
                              <SelectItem value="Operations">Operations</SelectItem>
                              <SelectItem value="Customer Support">Customer Support</SelectItem>
                            </SelectContent>
                          </Select>
                          {validationErrors.department && (
                            <p className="text-sm text-red-500">{validationErrors.department}</p>
                          )}
                        </div>
                      ) : (
                        employeeData.department
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      Job Title <span className="text-red-500">*</span>
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <div className="space-y-1">
                          <Input
                            value={formData.jobTitle || ""}
                            onChange={(e) => handleInputChange("jobTitle", e.target.value)}
                            className={validationErrors.jobTitle ? "border-red-500" : ""}
                          />
                          {validationErrors.jobTitle && (
                            <p className="text-sm text-red-500">{validationErrors.jobTitle}</p>
                          )}
                        </div>
                      ) : (
                        employeeData.jobTitle
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Employment Type</TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Select
                          value={formData.employmentType || ""}
                          onValueChange={(value) => handleInputChange("employmentType", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Full-time">Full-time</SelectItem>
                            <SelectItem value="Part-time">Part-time</SelectItem>
                            <SelectItem value="Contract">Contract</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        employeeData.employmentType
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      Hire Date <span className="text-red-500">*</span>
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <div className="space-y-1">
                          <Input
                            type="date"
                            value={formData.hireDate || ""}
                            disabled={true}
                            className="bg-gray-100 cursor-not-allowed"
                          />
                          <p className="text-xs text-amber-600">Hire date cannot be changed once set</p>
                        </div>
                      ) : (
                        employeeData.hireDate && formatDate(new Date(employeeData.hireDate))
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Current Salary</TableCell>
                    <TableCell>
                      {isEditing ? (
                        <div className="space-y-1">
                          <Input
                            type="number"
                            value={formData.currentSalary || ""}
                            onChange={(e) => handleInputChange("currentSalary", e.target.value)}
                            className={validationErrors.currentSalary ? "border-red-500" : ""}
                          />
                          {validationErrors.currentSalary && (
                            <p className="text-sm text-red-500">{validationErrors.currentSalary}</p>
                          )}
                        </div>
                      ) : (
                        employeeData.currentSalary && `$${Number(employeeData.currentSalary).toLocaleString()}`
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Reporting Manager</TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Select
                          value={formData.reportingManagerId || ""}
                          onValueChange={(value) => handleInputChange("reportingManagerId", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select manager" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="EMP010">Sarah Johnson (EMP010)</SelectItem>
                            <SelectItem value="EMP011">Michael Brown (EMP011)</SelectItem>
                            <SelectItem value="EMP012">Jessica Williams (EMP012)</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        employeeData.reportingManagerId && (
                          <Button
                            variant="link"
                            className="p-0 h-auto text-blue-600 hover:text-blue-800"
                            onClick={() => openManagerModal(employeeData.reportingManagerId)}
                          >
                            {employeeData.reportingManagerId}
                          </Button>
                        )
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Employment Status</TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Select
                          value={formData.employmentStatus || ""}
                          onValueChange={(value) => handleInputChange("employmentStatus", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="On Leave">On Leave</SelectItem>
                            <SelectItem value="Terminated">Terminated</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            employeeData.employmentStatus === "Active"
                              ? "bg-green-100 text-green-800"
                              : employeeData.employmentStatus === "On Leave"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {employeeData.employmentStatus}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>

                  {/* System Information Section */}
                  <TableRow className="bg-slate-100">
                    <TableCell colSpan={2} className="font-bold">
                      System Information
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Created At</TableCell>
                    <TableCell>{employeeData.createdAt && formatDate(new Date(employeeData.createdAt))}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Created By</TableCell>
                    <TableCell>{employeeData.createdBy}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Last Updated</TableCell>
                    <TableCell>{employeeData.updatedAt && formatDate(new Date(employeeData.updatedAt))}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Updated By</TableCell>
                    <TableCell>{employeeData.updatedBy}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-gray-500">No employee data available</div>
            )}
          </TabsContent>

          {/* Audit History Tab */}
          <TabsContent value="history">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Audit Trail</h3>

              {isLoadingAuditLogs ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mr-2" />
                  <span>Loading audit logs...</span>
                </div>
              ) : auditLogsError ? (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{auditLogsError}</div>
              ) : auditLogs.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Editor</TableHead>
                        <TableHead>Field</TableHead>
                        <TableHead>Old Value</TableHead>
                        <TableHead>New Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {auditLogs.flatMap((entry) =>
                        entry.actionType === "CREATE" ? (
                          // For CREATE actions, show one row with all new values
                          <TableRow key={entry.id}>
                            <TableCell>{formatDate(new Date(entry.dateOfUpdate))}</TableCell>
                            <TableCell>
                              <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                {entry.actionType}
                              </span>
                            </TableCell>
                            <TableCell>{entry.editorUsername}</TableCell>
                            <TableCell colSpan={3}>
                              <span className="italic">Initial employee record created</span>
                            </TableCell>
                          </TableRow>
                        ) : (
                          // For UPDATE actions, show one row per changed attribute
                          entry.attributesEdited
                            .filter((attr) => attr !== "updatedAt" && attr !== "updatedBy") // Filter out updatedAt and updatedBy
                            .map((attr, idx) => (
                              <TableRow key={`${entry.id}-${idx}`}>
                                <TableCell>{idx === 0 ? formatDate(new Date(entry.dateOfUpdate)) : ""}</TableCell>
                                <TableCell>
                                  {idx === 0 ? (
                                    <span
                                      className={`px-2 py-1 rounded-full text-xs ${
                                        entry.actionType === "UPDATE"
                                          ? "bg-blue-100 text-blue-800"
                                          : "bg-red-100 text-red-800"
                                      }`}
                                    >
                                      {entry.actionType}
                                    </span>
                                  ) : (
                                    ""
                                  )}
                                </TableCell>
                                <TableCell>{idx === 0 ? entry.editorUsername : ""}</TableCell>
                                <TableCell>
                                  {attr.split(".").length > 1
                                    ? `${attr.split(".")[0].charAt(0).toUpperCase() + attr.split(".")[0].slice(1)} > ${attr.split(".")[1].charAt(0).toUpperCase() + attr.split(".")[1].slice(1)}`
                                    : attr.charAt(0).toUpperCase() + attr.slice(1)}
                                </TableCell>
                                <TableCell className="text-red-600">
                                  {entry.oldValues[attr] !== undefined
                                    ? typeof entry.oldValues[attr] === "object" && entry.oldValues[attr] !== null
                                      ? JSON.stringify(entry.oldValues[attr])
                                      : String(entry.oldValues[attr])
                                    : "N/A"}
                                </TableCell>
                                <TableCell className="text-green-600">
                                  {entry.newValues[attr] !== undefined
                                    ? typeof entry.newValues[attr] === "object" && entry.newValues[attr] !== null
                                      ? JSON.stringify(entry.newValues[attr])
                                      : String(entry.newValues[attr])
                                    : "N/A"}
                                </TableCell>
                              </TableRow>
                            ))
                        ),
                      )}
                    </TableBody>
                  </Table>

                  {/* Pagination for audit logs */}
                  {auditLogsPagination.pages > 1 && (
                    <div className="flex justify-center mt-4">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fetchAuditLogs(Math.max(1, auditLogsPagination.page - 1))}
                          disabled={auditLogsPagination.page <= 1}
                        >
                          Previous
                        </Button>
                        <div className="flex items-center space-x-1">
                          {Array.from({ length: Math.min(5, auditLogsPagination.pages) }, (_, i) => {
                            // Show pages around the current page
                            let pageNum: number

                            if (auditLogsPagination.pages <= 5) {
                              // If 5 or fewer pages, show all
                              pageNum = i + 1
                            } else if (auditLogsPagination.page <= 3) {
                              // If near the start, show first 5 pages
                              pageNum = i + 1
                            } else if (auditLogsPagination.page >= auditLogsPagination.pages - 2) {
                              // If near the end, show last 5 pages
                              pageNum = auditLogsPagination.pages - 4 + i
                            } else {
                              // Otherwise show 2 before and 2 after current page
                              pageNum = auditLogsPagination.page - 2 + i
                            }

                            return (
                              <Button
                                key={pageNum}
                                variant={auditLogsPagination.page === pageNum ? "default" : "outline"}
                                size="sm"
                                onClick={() => fetchAuditLogs(pageNum)}
                              >
                                {pageNum}
                              </Button>
                            )
                          })}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            fetchAuditLogs(Math.min(auditLogsPagination.pages, auditLogsPagination.page + 1))
                          }
                          disabled={auditLogsPagination.page >= auditLogsPagination.pages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">No audit logs available for this employee</div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

