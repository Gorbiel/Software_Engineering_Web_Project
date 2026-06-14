"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { AdminCreateUserForm } from "@/components/admin/AdminCreateUserForm";
import { AdminDeleteUserSection } from "@/components/admin/AdminDeleteUserSection";

export function AdminPanel() {
  const isAdmin = useIsAdmin();
  const router = useRouter();

  useEffect(() => {
    if (isAdmin === false) {
      router.replace("/profile");
    }
  }, [isAdmin, router]);

  if (isAdmin !== true) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-text text-2xl font-semibold">Admin Panel</h1>
        <p className="text-text-muted text-sm">
          Create and remove user accounts.
        </p>
      </header>
      <AdminCreateUserForm />
      <AdminDeleteUserSection />
    </div>
  );
}
