"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Search, Edit, Loader2, AlertCircle, Plus } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import TopNavigation from "@/components/top-navigation";
import Footer from "@/components/footer";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { fetchUsers, updateUser, type User } from "@/lib/api/user-api";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Import the ResetPasswordDialog component
import ResetPasswordDialog from "@/components/reset-password-dialog";
import { useRouter } from "next/navigation";

export default function AccountsPage() {
  const { toast } = useToast();
  const router = useRouter();

  // State for users and loading
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for filters
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // State for pagination
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    pages: 1,
  });

  // State for selected user (for editing)
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // State for form submission
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for edit form
  const [editForm, setEditForm] = useState({
    fullName: "",
    email: "",
    roleLevel: "",
    activeStatus: true,
  });

  // Function to load users
  const loadUsers = async (page = 1) => {
    setIsLoading(true);
    setError(null);

    try {
      const params: any = {
        page,
        limit: pagination.limit,
      };

      // Add search term if provided
      if (searchTerm) {
        params.search = searchTerm;
      }

      // Add role filter if selected
      if (roleFilter !== "all") {
        params.role = roleFilter;
      }

      // Add status filter if selected
      if (statusFilter !== "all") {
        params.status = statusFilter;
      }

      const response = await fetchUsers(params);

      setUsers(response.data);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.message || "Failed to load users");
      toast({
        title: "Error",
        description: err.message || "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load users on initial render and when filters change
  useEffect(() => {
    loadUsers(1); // Reset to first page when filters change
  }, [searchTerm, roleFilter, statusFilter]);

  // Handle filter reset
  const resetFilters = () => {
    setSearchTerm("");
    setRoleFilter("all");
    setStatusFilter("all");
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    loadUsers(page);
  };

  // Handle edit user
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      fullName: user.fullName,
      email: user.email,
      roleLevel: user.roleLevel,
      activeStatus: user.activeStatus,
    });
  };

  // Handle edit form input change
  const handleEditFormChange = (field: string, value: any) => {
    setEditForm({
      ...editForm,
      [field]: value,
    });
  };

  // Handle edit form submission
  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    setIsSubmitting(true);

    try {
      await updateUser(selectedUser.id, editForm);

      toast({
        title: "Success",
        description: "User account updated successfully",
      });

      // Reload users
      loadUsers(pagination.page);

      // Close dialog
      setSelectedUser(null);
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

  // Format date for display
  const formatDate = (date: Date | string | null) => {
    if (!date) return "Never";
    return format(new Date(date), "yyyy-MM-dd HH:mm a");
  };

  // Generate pagination items
  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;

    // Calculate range of pages to show
    let startPage = Math.max(
      1,
      pagination.page - Math.floor(maxVisiblePages / 2)
    );
    const endPage = Math.min(pagination.pages, startPage + maxVisiblePages - 1);

    // Adjust if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Add first page and ellipsis if needed
    if (startPage > 1) {
      items.push(
        <PaginationItem key="first">
          <PaginationLink onClick={() => handlePageChange(1)}>1</PaginationLink>
        </PaginationItem>
      );

      if (startPage > 2) {
        items.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
    }

    // Add page numbers
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            isActive={pagination.page === i}
            onClick={() => handlePageChange(i)}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Add last page and ellipsis if needed
    if (endPage < pagination.pages) {
      if (endPage < pagination.pages - 1) {
        items.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      items.push(
        <PaginationItem key="last">
          <PaginationLink onClick={() => handlePageChange(pagination.pages)}>
            {pagination.pages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  return (
    <div className="flex min-h-screen flex-col app-dashboard-accounts-page">
      <TopNavigation activePage="accounts" />

      {/* Main content */}
      <div className="flex-1 p-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              System Account Management
            </h1>
            <p className="text-slate-600">
              Create and manage system user accounts
            </p>
          </div>

          <Button
            onClick={() => router.push("/dashboard/accounts/create")}
            className="bg-gradient-rainbow hover:opacity-90 transition-opacity"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create User
          </Button>
        </div>

        <Card className="border border-gray-200 shadow-sm bg-white">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search users..."
                  className="pl-10 border border-gray-300"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-full md:w-[150px] border border-gray-300">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="HR">HR</SelectItem>
                    <SelectItem value="USER">Regular User</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-[150px] border border-gray-300">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={resetFilters}
                  className="border border-gray-300"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="rounded-md border border-[hsl(var(--humane-border))] overflow-hidden bg-white">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User ID</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Full Name</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Email
                    </TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Last Login
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <div className="flex justify-center items-center">
                          <Loader2 className="h-6 w-6 animate-spin mr-2" />
                          <span>Loading users...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : users.length > 0 ? (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.userId}
                        </TableCell>
                        <TableCell>{user.username}</TableCell>
                        <TableCell>{user.fullName}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          {user.email}
                        </TableCell>
                        <TableCell>{user.roleLevel}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              user.activeStatus
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {user.activeStatus ? "Active" : "Inactive"}
                          </span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {formatDate(user.lastLogin)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="border border-gray-300"
                              onClick={() =>
                                router.push(
                                  `/dashboard/accounts/edit/${user.id}`
                                )
                              }
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center py-8 text-gray-500"
                      >
                        No users found matching your filters
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {!isLoading && users.length > 0 && pagination.pages > 1 && (
              <div className="mt-4 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          handlePageChange(Math.max(1, pagination.page - 1))
                        }
                        className={
                          pagination.page <= 1
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>

                    {renderPaginationItems()}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          handlePageChange(
                            Math.min(pagination.pages, pagination.page + 1)
                          )
                        }
                        className={
                          pagination.page >= pagination.pages
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}

            {/* Results summary */}
            {!isLoading && users.length > 0 && (
              <div className="mt-2 text-sm text-gray-500 text-center">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                of {pagination.total} users
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit User Dialog */}
      <Dialog
        open={!!selectedUser}
        onOpenChange={(open) => !open && setSelectedUser(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Account</DialogTitle>
            <DialogDescription>
              Update user account details for {selectedUser?.username}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-userid" className="text-right">
                User ID
              </Label>
              <Input
                id="edit-userid"
                defaultValue={selectedUser?.userId}
                className="col-span-3 border border-gray-300"
                disabled
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-username" className="text-right">
                Username
              </Label>
              <Input
                id="edit-username"
                defaultValue={selectedUser?.username}
                className="col-span-3 border border-gray-300"
                disabled
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-fullname" className="text-right">
                Full Name
              </Label>
              <Input
                id="edit-fullname"
                value={editForm.fullName}
                onChange={(e) =>
                  handleEditFormChange("fullName", e.target.value)
                }
                className="col-span-3 border border-gray-300"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-email" className="text-right">
                Email
              </Label>
              <Input
                id="edit-email"
                value={editForm.email}
                onChange={(e) => handleEditFormChange("email", e.target.value)}
                className="col-span-3 border border-gray-300"
                type="email"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-role" className="text-right">
                Role
              </Label>
              <Select
                value={editForm.roleLevel}
                onValueChange={(value) =>
                  handleEditFormChange("roleLevel", value)
                }
              >
                <SelectTrigger className="col-span-3 border border-gray-300">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="HR">HR</SelectItem>
                  <SelectItem value="USER">Regular User</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-status" className="text-right">
                Status
              </Label>
              <div className="flex items-center space-x-2 col-span-3">
                <Switch
                  id="edit-status"
                  checked={editForm.activeStatus}
                  onCheckedChange={(checked) =>
                    handleEditFormChange("activeStatus", checked)
                  }
                />
                <Label htmlFor="edit-status">
                  {editForm.activeStatus ? "Active" : "Inactive"}
                </Label>
              </div>
            </div>
          </div>
          <div className="flex justify-between">
            {selectedUser && (
              <ResetPasswordDialog
                username={selectedUser.username}
                userId={selectedUser.id}
              />
            )}
            <div className="space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedUser(null)}
                className="border border-gray-300"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleUpdateUser}
                disabled={isSubmitting}
                className="bg-gradient-rainbow hover:opacity-90 transition-opacity"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
