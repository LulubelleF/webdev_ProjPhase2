import { requireRole } from "@/lib/auth"
import CreateEmployeeForm from "@/components/create-employee-form"
import TopNavigation from "@/components/top-navigation"
import Footer from "@/components/footer"

export default async function CreateEmployeePage() {
// This will redirect to dashboard if not ADMIN or HR
await requireRole(["ADMIN", "HR"])

return (
  <div className="flex min-h-screen flex-col">
    <TopNavigation activePage="home" />

    <div className="flex-1 p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Create New Employee</h1>
        <p className="text-slate-600">Add a new employee to the system</p>
      </div>

      <CreateEmployeeForm />
    </div>

    <Footer />
  </div>
)
}
