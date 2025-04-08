"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { createUser } from "@/lib/api/user-api"
import { useRouter } from "next/navigation"
import { RainbowButton } from "@/components/ui/rainbow-button"

export default function CreateUserForm() {
  const { toast } = useToast()
  const router = useRouter()

  // State for new user form
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    email: "",
    fullName: "",
    roleLevel: "",
    activeStatus: true,
  })

  // State for form errors
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // State for form submission
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Handle new user form input change
  const handleNewUserChange = (field: string, value: any) => {
    setNewUser({
      ...newUser,
      [field]: value,
    })

    // Clear error for this field if it exists
    if (formErrors[field]) {
      setFormErrors({
        ...formErrors,
        [field]: "",
      })
    }
  }

  // Validate new user form
  const validateNewUserForm = () => {
    const errors: Record<string, string> = {}

    // Required fields
    if (!newUser.username) errors.username = "Username is required"
    if (!newUser.password) errors.password = "Password is required"
    if (!newUser.confirmPassword) errors.confirmPassword = "Please confirm password"
    if (!newUser.email) errors.email = "Email is required"
    if (!newUser.fullName) errors.fullName = "Full name is required"
    if (!newUser.roleLevel) errors.roleLevel = "Role is required"

    // Username format (alphanumeric and underscore only)
    if (newUser.username && !/^[a-zA-Z0-9_]+$/.test(newUser.username)) {
      errors.username = "Username can only contain letters, numbers, and underscores"
    }

    // Username length
    if (newUser.username && (newUser.username.length < 3 || newUser.username.length > 20)) {
      errors.username = "Username must be between 3 and 20 characters"
    }

    // Email format
    if (newUser.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email)) {
      errors.email = "Please enter a valid email address"
    }

    // Password strength
    if (newUser.password) {
      if (newUser.password.length < 8) {
        errors.password = "Password must be at least 8 characters long"
      } else if (!/[A-Z]/.test(newUser.password)) {
        errors.password = "Password must contain at least one uppercase letter"
      } else if (!/[a-z]/.test(newUser.password)) {
        errors.password = "Password must contain at least one lowercase letter"
      } else if (!/[0-9]/.test(newUser.password)) {
        errors.password = "Password must contain at least one number"
      } else if (!/[^A-Za-z0-9]/.test(newUser.password)) {
        errors.password = "Password must contain at least one special character"
      }
    }

    // Password confirmation
    if (newUser.password && newUser.confirmPassword && newUser.password !== newUser.confirmPassword) {
      errors.confirmPassword = "Passwords do not match"
    }

    // Full name validation
    if (newUser.fullName && newUser.fullName.length < 2) {
      errors.fullName = "Full name must be at least 2 characters long"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle new user form submission
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateNewUserForm()) {
      toast({
        title: "Validation Error",
        description: "Please correct the errors in the form",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      await createUser({
        username: newUser.username,
        password: newUser.password,
        email: newUser.email,
        fullName: newUser.fullName,
        roleLevel: newUser.roleLevel,
        activeStatus: newUser.activeStatus,
      })

      toast({
        title: "Success",
        description: "User account created successfully",
      })

      // Reset form
      setNewUser({
        username: "",
        password: "",
        confirmPassword: "",
        email: "",
        fullName: "",
        roleLevel: "",
        activeStatus: true,
      })

      // Redirect to accounts page
      router.push("/dashboard/accounts")
      router.refresh()
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to create user",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader className="border-b">
        <CardTitle>Create New User Account</CardTitle>
        <CardDescription>Add a new user to the system</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form className="space-y-6" onSubmit={handleCreateUser}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="username">
                Username <span className="text-red-500">*</span>
              </Label>
              <Input
                id="username"
                placeholder="Enter username"
                value={newUser.username}
                onChange={(e) => handleNewUserChange("username", e.target.value)}
                className={`border border-gray-300 ${formErrors.username ? "border-red-500" : ""}`}
              />
              {formErrors.username && <p className="text-sm text-red-500">{formErrors.username}</p>}
              <p className="text-sm text-slate-500">
                Username must be unique and contain only letters, numbers, and underscores.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="fullName"
                placeholder="Enter full name"
                value={newUser.fullName}
                onChange={(e) => handleNewUserChange("fullName", e.target.value)}
                className={`border border-gray-300 ${formErrors.fullName ? "border-red-500" : ""}`}
              />
              {formErrors.fullName && <p className="text-sm text-red-500">{formErrors.fullName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email"
                value={newUser.email}
                onChange={(e) => handleNewUserChange("email", e.target.value)}
                className={`border border-gray-300 ${formErrors.email ? "border-red-500" : ""}`}
              />
              {formErrors.email && <p className="text-sm text-red-500">{formErrors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">
                Role Level <span className="text-red-500">*</span>
              </Label>
              <Select value={newUser.roleLevel} onValueChange={(value) => handleNewUserChange("roleLevel", value)}>
                <SelectTrigger className={`border border-gray-300 ${formErrors.roleLevel ? "border-red-500" : ""}`}>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="HR">HR</SelectItem>
                  <SelectItem value="USER">Regular User</SelectItem>
                </SelectContent>
              </Select>
              {formErrors.roleLevel && <p className="text-sm text-red-500">{formErrors.roleLevel}</p>}
              <p className="text-sm text-slate-500">
                The role determines what actions the user can perform in the system.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                Password <span className="text-red-500">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={newUser.password}
                onChange={(e) => handleNewUserChange("password", e.target.value)}
                className={`border border-gray-300 ${formErrors.password ? "border-red-500" : ""}`}
              />
              {formErrors.password && <p className="text-sm text-red-500">{formErrors.password}</p>}
              <p className="text-sm text-slate-500">
                Password must be at least 8 characters long with a mix of uppercase, lowercase, numbers, and symbols.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">
                Confirm Password <span className="text-red-500">*</span>
              </Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirm password"
                value={newUser.confirmPassword}
                onChange={(e) => handleNewUserChange("confirmPassword", e.target.value)}
                className={`border border-gray-300 ${formErrors.confirmPassword ? "border-red-500" : ""}`}
              />
              {formErrors.confirmPassword && <p className="text-sm text-red-500">{formErrors.confirmPassword}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Account Status</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="status"
                  checked={newUser.activeStatus}
                  onCheckedChange={(checked) => handleNewUserChange("activeStatus", checked)}
                />
                <Label htmlFor="status">{newUser.activeStatus ? "Active" : "Inactive"}</Label>
              </div>
              <p className="text-sm text-slate-500">Inactive accounts cannot log in to the system.</p>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/accounts")}
              className="border border-gray-300"
            >
              Cancel
            </Button>
            <RainbowButton type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Account"
              )}
            </RainbowButton>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

