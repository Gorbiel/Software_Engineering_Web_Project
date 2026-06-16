"use client";

import { useEffect, useRef, useState } from "react";
import { SmilePlus } from "lucide-react";
import { REACTION_OPTIONS } from "@/utils/reactions";

type ReactionPickerProps = {
  activeCode: string | null;
  disabled: boolean;
  onSelect: (code: string) => void;
};

export function ReactionPicker({
  activeCode,
  disabled,
  onSelect,
}: ReactionPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    function handleClick(event: MouseEvent) {
      if (ref.current?.contains(event.target as Node)) {
        return;
      }
      setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  const activeOption = activeCode
    ? (REACTION_OPTIONS.find((option) => option.code === activeCode) ?? null)
    : null;

  function handleSelect(code: string) {
    setIsOpen(false);
    onSelect(code);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className={`flex cursor-pointer items-center gap-1 rounded-full px-2 py-1 font-semibold transition select-none disabled:cursor-not-allowed disabled:opacity-60 ${
          activeOption
            ? "bg-accent-2-softer text-accent-2"
            : "text-text-muted hover:bg-accent-2-soft hover:text-accent-2"
        }`}
      >
        {activeOption ? (
          <>
            <span className="text-sm leading-none">{activeOption.emoji}</span>
            <span>{activeOption.label}</span>
          </>
        ) : (
          <>
            <SmilePlus className="h-4 w-4" />
            <span>React</span>
          </>
        )}
      </button>
      {isOpen ? (
        <div className="bg-surface border-border absolute bottom-full left-0 z-10 mb-2 flex gap-1 rounded-full border p-1.5 shadow-md">
          {REACTION_OPTIONS.map((option) => (
            <button
              key={option.code}
              type="button"
              title={option.label}
              onClick={() => handleSelect(option.code)}
              className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-lg transition select-none hover:scale-125 ${
                option.code === activeCode
                  ? "bg-accent-soft"
                  : "hover:bg-background"
              }`}
            >
              {option.emoji}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
