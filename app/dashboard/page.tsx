"use client";

import { useState, useEffect } from "react";
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
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
// Add the import for the Plus icon at the top of the file
import { Search, Filter, Loader2, Plus } from "lucide-react";
import EmployeeDetailModal from "@/components/employee-detail-modal";
import TopNavigation from "@/components/top-navigation";
import Footer from "@/components/footer";
import { useToast } from "@/components/ui/use-toast";
import { fetchEmployees, type Employee } from "@/lib/api/employee-api";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function DashboardPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { data: session } = useSession();

  // State for employees and loading
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for filters
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // State for pagination
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    pages: 1,
  });

  // Check if user has permission to create employees (ADMIN or HR)
  const canCreateEmployee =
    session?.user?.role === "ADMIN" || session?.user?.role === "HR";

  // Function to load employees
  const loadEmployees = async (page = 1) => {
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

      // Add department filter if selected
      if (departmentFilter !== "all") {
        params.department = departmentFilter;
      }

      // Add status filter if selected
      if (statusFilter !== "all") {
        params.status = statusFilter;
      }

      const response = await fetchEmployees(params);

      setEmployees(response.data);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.message || "Failed to load employees");
      toast({
        title: "Error",
        description: err.message || "Failed to load employees",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load employees on initial render and when filters change
  useEffect(() => {
    loadEmployees(1); // Reset to first page when filters change
  }, [searchTerm, departmentFilter, statusFilter]);

  // Handle filter reset
  const resetFilters = () => {
    setSearchTerm("");
    setDepartmentFilter("all");
    setStatusFilter("all");
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    loadEmployees(page);
  };

  // Convert full employee data to simplified format for the table
  const simplifyEmployeeData = (employee: Employee) => {
    return {
      id: employee.id,
      employeeId: employee.employeeId,
      name: `${employee.firstName} ${employee.lastName}`,
      department: employee.department,
      position: employee.jobTitle,
      status: employee.employmentStatus,
    };
  };

  return (
    <div className="flex min-h-screen flex-col app-dashboard-page">
      <TopNavigation activePage="home" />

      {/* Main content */}
      <div className="flex-1 p-8">
        {/* Find the div with the h1 "Employee Directory" and modify it to: */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Employee Directory
            </h1>
            <p className="text-slate-600">
              Manage and view all employee information
            </p>
          </div>

          {/* Only show Create Employee button for ADMIN and HR roles */}
          {canCreateEmployee && (
            <Button
              onClick={() => router.push("/dashboard/employees/create")}
              className="bg-gradient-rainbow hover:opacity-90 transition-opacity"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Employee
            </Button>
          )}
        </div>

        {/* Search and filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, department, or ID..."
              className="pl-10 border-gray-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select
              value={departmentFilter}
              onValueChange={setDepartmentFilter}
            >
              <SelectTrigger className="w-[180px] border-gray-300">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
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

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] border-gray-300">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
                <SelectItem value="On Leave">On Leave</SelectItem>
                <SelectItem value="Terminated">Terminated</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="icon"
              className="border-gray-300"
              onClick={resetFilters}
              title="Reset filters"
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Employee table */}
        <div className="bg-white rounded-lg overflow-hidden border border-[hsl(var(--humane-border))]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex justify-center items-center">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <span>Loading employees...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-red-500"
                  >
                    {error}
                  </TableCell>
                </TableRow>
              ) : employees.length > 0 ? (
                employees.map((employee) => {
                  const simplifiedEmployee = simplifyEmployeeData(employee);
                  return (
                    <TableRow key={employee.id}>
                      <TableCell className="font-medium">
                        {employee.employeeId}
                      </TableCell>
                      <TableCell>{`${employee.firstName} ${employee.lastName}`}</TableCell>
                      <TableCell>{employee.department}</TableCell>
                      <TableCell>{employee.jobTitle}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            employee.employmentStatus === "Active"
                              ? "bg-green-100 text-green-800"
                              : employee.employmentStatus === "On Leave"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {employee.employmentStatus}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <EmployeeDetailModal employee={simplifiedEmployee} />
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-gray-500"
                  >
                    No employees found matching your filters
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {!isLoading && employees.length > 0 && (
          <div className="mt-4">
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

                {/* Generate page links */}
                {Array.from(
                  { length: Math.min(5, pagination.pages) },
                  (_, i) => {
                    // Show pages around the current page
                    let pageNum: number;

                    if (pagination.pages <= 5) {
                      // If 5 or fewer pages, show all
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      // If near the start, show first 5 pages
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.pages - 2) {
                      // If near the end, show last 5 pages
                      pageNum = pagination.pages - 4 + i;
                    } else {
                      // Otherwise show 2 before and 2 after current page
                      pageNum = pagination.page - 2 + i;
                    }

                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          onClick={() => handlePageChange(pageNum)}
                          isActive={pagination.page === pageNum}
                          className="cursor-pointer"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  }
                )}

                {/* Show ellipsis if there are more pages */}
                {pagination.pages > 5 &&
                  pagination.page < pagination.pages - 2 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}

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
      </div>

      <Footer />
    </div>
  );
}
