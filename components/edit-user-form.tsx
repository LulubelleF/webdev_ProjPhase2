"use client";

import type React from "react";

import { useState, useEffect } from "react";
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
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { fetchUserById, updateUser, type User } from "@/lib/api/user-api";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import ResetPasswordDialog from "@/components/reset-password-dialog";
import { RainbowButton } from "@/components/ui/rainbow-button";

interface EditUserFormProps {
  userId: string;
}

export default function EditUserForm({ userId }: EditUserFormProps) {
  const { toast } = useToast();
  const router = useRouter();

  // State for user data
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for edit form
  const [editForm, setEditForm] = useState({
    fullName: "",
    email: "",
    roleLevel: "",
    activeStatus: true,
  });

  // State for form errors
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // State for form submission
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load user data
  useEffect(() => {
    const loadUser = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const userData = await fetchUserById(userId);
        setUser(userData);
        setEditForm({
          fullName: userData.fullName,
          email: userData.email,
          roleLevel: userData.roleLevel,
          activeStatus: userData.activeStatus,
        });
      } catch (err: any) {
        setError(err.message || "Failed to load user");
        toast({
          title: "Error",
          description: err.message || "Failed to load user",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [userId, toast]);

  // Handle edit form input change
  const handleEditFormChange = (field: string, value: any) => {
    setEditForm({
      ...editForm,
      [field]: value,
    });

    // Clear error for this field if it exists
    if (formErrors[field]) {
      setFormErrors({
        ...formErrors,
        [field]: "",
      });
    }
  };

  // Validate edit form
  const validateEditForm = () => {
    const errors: Record<string, string> = {};

    // Required fields
    if (!editForm.fullName) errors.fullName = "Full name is required";
    if (!editForm.email) errors.email = "Email is required";
    if (!editForm.roleLevel) errors.roleLevel = "Role is required";

    // Email format
    if (editForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email)) {
      errors.email = "Please enter a valid email address";
    }

    // Full name validation
    if (editForm.fullName && editForm.fullName.length < 2) {
      errors.fullName = "Full name must be at least 2 characters long";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle edit form submission
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEditForm()) {
      toast({
        title: "Validation Error",
        description: "Please correct the errors in the form",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await updateUser(userId, editForm);

      toast({
        title: "Success",
        description: "User account updated successfully",
      });

      // Redirect to accounts page
      router.push("/dashboard/accounts");
      router.refresh();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to update user",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <span>Loading user data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!user) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>User not found</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit User Account</CardTitle>
        <CardDescription>
          Update user account details for {user.username}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={handleUpdateUser}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="userId">User ID</Label>
              <Input id="userId" value={user.userId} disabled />
              <p className="text-sm text-slate-500">
                User ID cannot be changed
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" value={user.username} disabled />
              <p className="text-sm text-slate-500">
                Username cannot be changed
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="fullName"
                placeholder="Enter full name"
                value={editForm.fullName}
                onChange={(e) =>
                  handleEditFormChange("fullName", e.target.value)
                }
                className={formErrors.fullName ? "border-red-500" : ""}
              />
              {formErrors.fullName && (
                <p className="text-sm text-red-500">{formErrors.fullName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email"
                value={editForm.email}
                onChange={(e) => handleEditFormChange("email", e.target.value)}
                className={formErrors.email ? "border-red-500" : ""}
              />
              {formErrors.email && (
                <p className="text-sm text-red-500">{formErrors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">
                Role Level <span className="text-red-500">*</span>
              </Label>
              <Select
                value={editForm.roleLevel}
                onValueChange={(value) =>
                  handleEditFormChange("roleLevel", value)
                }
              >
                <SelectTrigger
                  className={formErrors.roleLevel ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="HR">HR</SelectItem>
                  <SelectItem value="USER">Regular User</SelectItem>
                </SelectContent>
              </Select>
              {formErrors.roleLevel && (
                <p className="text-sm text-red-500">{formErrors.roleLevel}</p>
              )}
              <p className="text-sm text-slate-500">
                The role determines what actions the user can perform in the
                system.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Account Status</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="status"
                  checked={editForm.activeStatus}
                  onCheckedChange={(checked) =>
                    handleEditFormChange("activeStatus", checked)
                  }
                />
                <Label htmlFor="status">
                  {editForm.activeStatus ? "Active" : "Inactive"}
                </Label>
              </div>
              <p className="text-sm text-slate-500">
                Inactive accounts cannot log in to the system.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Password</Label>
              <div>
                <ResetPasswordDialog
                  username={user.username}
                  userId={user.id}
                />
              </div>
              <p className="text-sm text-slate-500">
                Use the reset button to generate a new password for this user.
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/accounts")}
            >
              Cancel
            </Button>
            <RainbowButton type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </RainbowButton>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
