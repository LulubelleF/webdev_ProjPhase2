"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { createEmployee } from "@/lib/api/employee-api";
import { RainbowButton } from "@/components/ui/rainbow-button";

export default function CreateEmployeeForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state - simplified with only essential fields
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: "",

    // Address
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",

    // Emergency contact
    emergencyName: "",
    emergencyRelationship: "",
    emergencyPhoneNumber: "",

    // Employment Info
    department: "",
    jobTitle: "",
    employmentType: "Full-time",
    hireDate: "",
    currentSalary: "",
    reportingManagerId: "",
    workLocation: "",
    workEmail: "",
    workPhone: "",
    employmentStatus: "Active",
  });

  // Form validation state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Handle input change
  const handleInputChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value,
    });

    // Clear error for this field if it exists
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: "",
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required fields validation
    const requiredFields = [
      { key: "firstName", label: "First Name" },
      { key: "lastName", label: "Last Name" },
      { key: "email", label: "Email" },
      { key: "department", label: "Department" },
      { key: "jobTitle", label: "Job Title" },
      { key: "hireDate", label: "Hire Date" },
      { key: "dateOfBirth", label: "Date of Birth" },
    ];

    requiredFields.forEach(({ key, label }) => {
      if (!formData[key as keyof typeof formData]) {
        newErrors[key] = `${label} is required`;
      }
    });

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Work email validation if provided
    if (
      formData.workEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.workEmail)
    ) {
      newErrors.workEmail = "Please enter a valid work email address";
    }

    if (formData.dateOfBirth) {
      const dob = new Date(formData.dateOfBirth);
      const today = new Date();

      if (isNaN(dob.getTime())) {
        newErrors.dateOfBirth = "Invalid date format";
      } else if (dob > today) {
        newErrors.dateOfBirth = "Date of birth cannot be in the future";
      } else if (dob.getFullYear() === today.getFullYear()) {
        newErrors.dateOfBirth = "Year of birth cannot be the current year";
      }
    }

    if (formData.hireDate) {
      const hireDate = new Date(formData.hireDate);
      if (isNaN(hireDate.getTime())) {
        newErrors.hireDate = "Invalid date format";
      } else {
        const maxFutureDate = new Date();
        maxFutureDate.setFullYear(maxFutureDate.getFullYear() + 1);
        if (hireDate > maxFutureDate) {
          newErrors.hireDate =
            "Hire date cannot be more than 1 year in the future";
        }

        if (formData.dateOfBirth) {
          const dob = new Date(formData.dateOfBirth);
          if (!isNaN(dob.getTime()) && hireDate < dob) {
            newErrors.hireDate =
              "Hire date cannot be earlier than date of birth";
          }
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please correct the errors in the form",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Prepare data for API
      const employeeData = {
        ...formData,
        // Convert salary to number or leave as undefined
        currentSalary: formData.currentSalary
          ? Number.parseFloat(formData.currentSalary)
          : undefined,
      };

      // Submit the form data to the API
      await createEmployee(employeeData);

      toast({
        title: "Success",
        description: "Employee created successfully",
      });

      // Redirect to the dashboard
      router.push("/dashboard");
      router.refresh();
    } catch (error: any) {
      console.error("Error creating employee:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create employee",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="border-b">
          <CardTitle>Create New Employee</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Personal Information */}
            <div className="space-y-2">
              <Label htmlFor="firstName">
                First Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                className={`border border-gray-300 ${
                  errors.firstName ? "border-red-500" : ""
                }`}
              />
              {errors.firstName && (
                <p className="text-sm text-red-500">{errors.firstName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">
                Last Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                className={`border border-gray-300 ${
                  errors.lastName ? "border-red-500" : ""
                }`}
              />
              {errors.lastName && (
                <p className="text-sm text-red-500">{errors.lastName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={`border border-gray-300 ${
                  errors.email ? "border-red-500" : ""
                }`}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) =>
                  handleInputChange("phoneNumber", e.target.value)
                }
                className="border border-gray-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">
                Date of Birth <span className="text-red-500">*</span>
              </Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) =>
                  handleInputChange("dateOfBirth", e.target.value)
                }
                className={`border border-gray-300 ${
                  errors.dateOfBirth ? "border-red-500" : ""
                }`}
                required
              />
              {errors.dateOfBirth && (
                <p className="text-sm text-red-500">{errors.dateOfBirth}</p>
              )}
              <p className="text-sm text-slate-500">
                <strong>Note:</strong> Date of birth cannot be changed once set
              </p>
            </div>

            {/* Employment Information */}
            <div className="space-y-2">
              <Label htmlFor="department">
                Department <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.department}
                onValueChange={(value) =>
                  handleInputChange("department", value)
                }
              >
                <SelectTrigger
                  className={`border border-gray-300 ${
                    errors.department ? "border-red-500" : ""
                  }`}
                >
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Engineering">Engineering</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="HR">HR</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Sales">Sales</SelectItem>
                  <SelectItem value="Operations">Operations</SelectItem>
                  <SelectItem value="Customer Support">
                    Customer Support
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.department && (
                <p className="text-sm text-red-500">{errors.department}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobTitle">
                Job Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="jobTitle"
                value={formData.jobTitle}
                onChange={(e) => handleInputChange("jobTitle", e.target.value)}
                className={`border border-gray-300 ${
                  errors.jobTitle ? "border-red-500" : ""
                }`}
              />
              {errors.jobTitle && (
                <p className="text-sm text-red-500">{errors.jobTitle}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="hireDate">
                Hire Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="hireDate"
                type="date"
                value={formData.hireDate}
                onChange={(e) => handleInputChange("hireDate", e.target.value)}
                className={`border border-gray-300 ${
                  errors.hireDate ? "border-red-500" : ""
                }`}
                required
              />
              {errors.hireDate && (
                <p className="text-sm text-red-500">{errors.hireDate}</p>
              )}
              <p className="text-sm text-slate-500">
                <strong>Note:</strong> Hire date cannot be changed once set
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentSalary">Current Salary</Label>
              <Input
                id="currentSalary"
                type="number"
                value={formData.currentSalary}
                onChange={(e) =>
                  handleInputChange("currentSalary", e.target.value)
                }
                className="border border-gray-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="employmentType">Employment Type</Label>
              <Select
                value={formData.employmentType}
                onValueChange={(value) =>
                  handleInputChange("employmentType", value)
                }
              >
                <SelectTrigger className="border border-gray-300">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Full-time">Full-time</SelectItem>
                  <SelectItem value="Part-time">Part-time</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                  <SelectItem value="Temporary">Temporary</SelectItem>
                  <SelectItem value="Intern">Intern</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="employmentStatus">Employment Status</Label>
              <Select
                value={formData.employmentStatus}
                onValueChange={(value) =>
                  handleInputChange("employmentStatus", value)
                }
              >
                <SelectTrigger className="border border-gray-300">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="On Leave">On Leave</SelectItem>
                  <SelectItem value="Terminated">Terminated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard")}
            className="border border-gray-300"
          >
            Cancel
          </Button>
          <RainbowButton
            type="submit"
            className="w-full md:w-auto"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Employee"
            )}
          </RainbowButton>
        </CardFooter>
      </Card>
    </form>
  );
}
