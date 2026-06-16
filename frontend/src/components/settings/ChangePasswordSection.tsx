"use client";

import { useState } from "react";
import { PasswordModal } from "@/components/settings/PasswordModal";
import { changePassword } from "@/utils/profile";

export function ChangePasswordSection() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="glaze-card flex items-center justify-between gap-3">
      <div className="flex flex-col">
        <h2 className="text-text text-sm font-semibold">Password</h2>
        <p className="text-text-muted text-xs">
          Change your account password.
        </p>
      </div>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="bg-primary text-primary-contrast hover:bg-primary-strong shrink-0 cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition select-none"
      >
        Change password
      </button>
      {isOpen ? (
        <PasswordModal
          title="Change password"
          requireCurrent
          onClose={() => setIsOpen(false)}
          onSubmit={(values) =>
            changePassword({
              currentPassword: values.currentPassword,
              newPassword: values.newPassword,
              newPasswordConfirmation: values.newPasswordConfirmation,
            })
          }
        />
      ) : null}
    </section>
  );
}
