import type { Metadata } from "next";

import { AdminDashboardShell } from "@/components/admin/admin-dashboard-shell";

export const metadata: Metadata = {
  title: "Admin",
  description: "Protected admin dashboard for Bismillah Accessories.",
};

export default function AdminPage() {
  return (
    <main className="bg-[#fafaf8] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <AdminDashboardShell />
      </div>
    </main>
  );
}
