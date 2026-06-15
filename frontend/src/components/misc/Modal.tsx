"use client";

import { useEffect, type ReactNode } from "react";

type ModalProps = {
  onClose: () => void;
  children: ReactNode;
  panelClassName?: string;
  backdropClassName?: string;
  ariaLabel?: string;
  // When true, backdrop click and Escape won't dismiss (e.g. during a pending submit).
  closeDisabled?: boolean;
};

const DEFAULT_BACKDROP =
  "fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4";
const DEFAULT_PANEL = "glaze-card w-full max-w-md";

// Generic centered modal: full-screen backdrop, click-outside and Escape to
// close, dialog semantics. Visuals are left to the caller via className props.
export function Modal({
  onClose,
  children,
  panelClassName = DEFAULT_PANEL,
  backdropClassName = DEFAULT_BACKDROP,
  ariaLabel,
  closeDisabled = false,
}: ModalProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !closeDisabled) {
        onClose();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, closeDisabled]);

  return (
    <div
      className={backdropClassName}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !closeDisabled) {
          onClose();
        }
      }}
    >
      <div className={panelClassName}>{children}</div>
    </div>
  );
}
