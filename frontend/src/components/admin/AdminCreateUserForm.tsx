"use client";

import { useState } from "react";
import { createUser } from "@/utils/admin";

type SaveState = "idle" | "saving" | "saved" | "error";

export function AdminCreateUserForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setSaveState("saving");
    setErrorMsg(null);

    try {
      await createUser({ name: name.trim(), email: email.trim(), password });
      setName("");
      setEmail("");
      setPassword("");
      setSaveState("saved");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to create.");
      setSaveState("error");
    }
  }

  function resetState() {
    if (saveState !== "saving") {
      setSaveState("idle");
    }
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
      <section className="glaze-card flex flex-col gap-6">
        <h2 className="text-text text-sm font-semibold">Add user account</h2>
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex flex-1 flex-col gap-2">
            <label
              htmlFor="new-user-name"
              className="text-text-muted ml-3 text-xs font-semibold"
            >
              Full name
            </label>
            <input
              id="new-user-name"
              className="bg-background text-text rounded-2xl px-4 py-2 text-sm focus:outline-none"
              type="text"
              required
              value={name}
              onChange={(e) => {
                resetState();
                setName(e.target.value);
              }}
            />
          </div>
          <div className="flex flex-1 flex-col gap-2">
            <label
              htmlFor="new-user-email"
              className="text-text-muted ml-3 text-xs font-semibold"
            >
              E-mail
            </label>
            <input
              id="new-user-email"
              className="bg-background text-text rounded-2xl px-4 py-2 text-sm focus:outline-none"
              type="email"
              required
              value={email}
              onChange={(e) => {
                resetState();
                setEmail(e.target.value);
              }}
            />
          </div>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex flex-1 flex-col gap-2">
            <label
              htmlFor="new-user-password"
              className="text-text-muted ml-3 text-xs font-semibold"
            >
              Password
            </label>
            <input
              id="new-user-password"
              className="bg-background text-text rounded-2xl px-4 py-2 text-sm focus:outline-none"
              type="password"
              required
              value={password}
              onChange={(e) => {
                resetState();
                setPassword(e.target.value);
              }}
            />
          </div>
        </div>

        {saveState === "error" && errorMsg ? (
          <p className="bg-accent-softer text-accent rounded-2xl px-4 py-2 text-xs font-semibold">
            {errorMsg}
          </p>
        ) : null}

        {saveState === "saved" ? (
          <p className="bg-accent-2-soft text-accent-2 rounded-2xl px-4 py-2 text-xs font-semibold">
            Account created.
          </p>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={saveState === "saving"}
            className="bg-primary text-primary-contrast hover:bg-primary-strong cursor-pointer rounded-full px-5 py-2 text-sm font-semibold transition select-none disabled:opacity-60"
          >
            {saveState === "saving" ? "Creating…" : "Create account"}
          </button>
        </div>
      </section>
    </form>
  );
}
