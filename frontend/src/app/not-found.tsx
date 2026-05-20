import Link from "next/link";
import { Undo2 } from "lucide-react";

export default function NotFound() {
  return (
    <div className="glaze-card mx-auto flex w-full max-w-2xl flex-col gap-6 text-center">
      <div className="bg-accent-soft mx-auto flex h-20 w-20 items-center justify-center rounded-full text-3xl">
        🍩
      </div>
      <div className="flex flex-col gap-3">
        <h1 className="text-text text-2xl font-extrabold tracking-tight sm:text-3xl">
          404
        </h1>
        <p className="text-text-muted text-sm sm:text-base">
          This page got lost in the glaze.
        </p>
      </div>
      <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          href="/"
          className="bg-primary text-primary-contrast hover:bg-primary-strong inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition select-none"
        >
          <Undo2 className="h-4 w-4" />
          Take me home
        </Link>
      </div>
    </div>
  );
}
