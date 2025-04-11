import type React from "react";
import { requireRole } from "@/lib/auth";

export default async function AccountsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This will redirect to dashboard if not ADMIN (removed HR)
  await requireRole(["ADMIN"]);

  return <>{children}</>;
}
