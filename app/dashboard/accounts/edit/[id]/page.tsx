import { requireRole } from "@/lib/auth";
import EditUserForm from "@/components/edit-user-form";
import TopNavigation from "@/components/top-navigation";
import Footer from "@/components/footer";

export default async function EditUserPage({
  params,
}: {
  params: { id: string };
}) {
  // This will redirect to dashboard if not ADMIN (removed HR)
  await requireRole(["ADMIN"]);

  return (
    <div className="flex min-h-screen flex-col">
      <TopNavigation activePage="accounts" />

      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">
            Edit User Account
          </h1>
          <p className="text-slate-600">Update user account details</p>
        </div>

        <EditUserForm userId={params.id} />
      </div>

      <Footer />
    </div>
  );
}
