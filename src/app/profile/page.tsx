import { AppShell } from "@/components/layout/app-shell";
import { ProfileForm } from "@/components/profile/profile-form";

export default function ProfilePage() {
  return (
    <AppShell
      title="Profile and Goals"
      description="Update your body metrics, calorie target, macro goals, and flexible budget settings."
      showAccountMenu
    >
      <ProfileForm />
    </AppShell>
  );
}
