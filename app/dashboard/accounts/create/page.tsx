import { requireRole } from "@/lib/auth";
import CreateUserForm from "@/components/create-user-form";
import TopNavigation from "@/components/top-navigation";
import Footer from "@/components/footer";

export default async function CreateUserPage() {
  // This will redirect to dashboard if not ADMIN
  await requireRole(["ADMIN"]);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <TopNavigation activePage="accounts" />

      <div className="flex-1 p-8 bg-gradient-to-br from-humane-blue/5 to-humane-purple/5">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">
            Create New User Account
          </h1>
          <p className="text-slate-600">Add a new user to the system</p>
        </div>

        <CreateUserForm />
      </div>

      <Footer />
    </div>
  );
}
