import { ProfileShell } from "@/components/profile/profile-shell";

export const metadata = {
  title: "My Profile | Bismillah Accessories",
  description: "Manage your account, track orders, and update your delivery addresses.",
};

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-[#fafaf8]">
      <ProfileShell />
    </main>
  );
}
