"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import { SearchSelect } from "@/components/reports/SearchSelect";
import { searchUserOptions } from "@/utils/userSearchOptions";

type TeamMemberAdderProps = {
  disabled: boolean;
  onAdd: (userId: number) => void;
};

export function TeamMemberAdder({ disabled, onAdd }: TeamMemberAdderProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="bg-accent-2 text-primary-contrast flex shrink-0 cursor-pointer items-center gap-1 rounded-full px-4 py-1.5 text-xs font-semibold transition select-none hover:opacity-90"
      >
        <UserPlus className="h-4 w-4" />
        Add member
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <SearchSelect
        placeholder="Search a user to add…"
        search={searchUserOptions}
        selected={null}
        onClear={() => {}}
        onSelect={(option) => onAdd(option.id)}
      />
      <button
        type="button"
        onClick={() => setIsOpen(false)}
        disabled={disabled}
        className="text-text-muted hover:text-text hover:bg-background shrink-0 cursor-pointer rounded-full px-3 py-1.5 text-xs font-semibold transition select-none disabled:cursor-not-allowed disabled:opacity-60"
      >
        Done
      </button>
    </div>
  );
}
