import { ProfilePhotoSection } from "@/components/settings/ProfilePhotoSection";
import { ProfileDetailsForm } from "@/components/settings/ProfileDetailsForm";

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-text text-2xl font-semibold">Profile Settings</h1>
        <p className="text-text-muted text-sm">
          Update your personal details and profile photo.
        </p>
      </header>
      <ProfilePhotoSection />
      <ProfileDetailsForm />
    </div>
  );
}
