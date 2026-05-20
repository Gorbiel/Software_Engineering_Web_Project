"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginRequest, saveSession } from "@/utils/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsPending(true);

    try {
      const session = await loginRequest(email, password);
      saveSession(session);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="text-primary text-[48px] font-extrabold tracking-[-0.02em] select-none">
            GlazedIn
          </span>
          <p className="text-text-muted mt-2 text-sm font-semibold">
            Sign in to your account
          </p>
        </div>

        <form
          className="glaze-card flex flex-col gap-5"
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col gap-2">
            <label
              htmlFor="email"
              className="text-text-muted text-xs font-semibold"
            >
              E-mail
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-background text-text placeholder:text-text-muted rounded-2xl px-4 py-2 text-sm focus:outline-none"
              placeholder="you@company.com"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="password"
              className="text-text-muted text-xs font-semibold"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-background text-text placeholder:text-text-muted rounded-2xl px-4 py-2 text-sm focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          {error ? (
            <p className="bg-accent-softer text-accent rounded-2xl px-4 py-2 text-xs font-semibold">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isPending}
            className="bg-primary text-primary-contrast hover:bg-primary-strong cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition select-none disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
