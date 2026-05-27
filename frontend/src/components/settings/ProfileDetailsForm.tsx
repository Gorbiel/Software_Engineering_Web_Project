"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getAccessToken, saveUser } from "@/utils/auth";

type SaveState = "idle" | "saving" | "saved" | "error";

export function ProfileDetailsForm() {
  const { user } = useAuth();

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setSaveState("saving");
    setErrorMsg(null);

    try {
      const token = getAccessToken();
      const res = await fetch("/api/auth/me/", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(
          data?.detail ??
            data?.name?.[0] ??
            data?.email?.[0] ??
            "Failed to save.",
        );
      }

      const updated = await res.json();
      saveUser({ id: updated.id, name: updated.name, email: updated.email });
      setSaveState("saved");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to save.");
      setSaveState("error");
    }
  }

  function handleCancel() {
    setName(user?.name ?? "");
    setEmail(user?.email ?? "");
    setSaveState("idle");
    setErrorMsg(null);
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
      <section className="glaze-card flex flex-col gap-6">
        <h2 className="text-text text-sm font-semibold">Profile details</h2>
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex flex-1 flex-col gap-2">
            <label
              htmlFor="name"
              className="text-text-muted ml-3 text-xs font-semibold"
            >
              Full name
            </label>
            <input
              id="name"
              className="bg-background text-text rounded-2xl px-4 py-2 text-sm focus:outline-none"
              type="text"
              value={name}
              onChange={(e) => {
                setSaveState("idle");
                setName(e.target.value);
              }}
            />
          </div>
          <div className="flex flex-1 flex-col gap-2">
            <label
              htmlFor="email"
              className="text-text-muted ml-3 text-xs font-semibold"
            >
              E-mail
            </label>
            <input
              id="email"
              className="bg-background text-text rounded-2xl px-4 py-2 text-sm focus:outline-none"
              type="email"
              value={email}
              onChange={(e) => {
                setSaveState("idle");
                setEmail(e.target.value);
              }}
            />
          </div>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex flex-1 flex-col gap-2">
            <label className="text-text-muted ml-3 text-xs font-semibold">
              Job title
            </label>
            <input
              className="bg-background text-text rounded-2xl px-4 py-2 text-sm focus:outline-none"
              type="text"
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-text-muted ml-3 text-xs font-semibold">
            Bio
          </label>
          <textarea className="bg-background text-text min-h-28 resize-none rounded-2xl px-3 py-2 text-sm focus:outline-none" />
        </div>
      </section>

      {saveState === "error" && errorMsg ? (
        <p className="bg-accent-softer text-accent rounded-2xl px-4 py-2 text-xs font-semibold">
          {errorMsg}
        </p>
      ) : null}

      {saveState === "saved" ? (
        <p className="bg-accent-2-soft text-accent-2 rounded-2xl px-4 py-2 text-xs font-semibold">
          Changes saved.
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={saveState === "saving"}
          className="bg-primary text-primary-contrast hover:bg-primary-strong cursor-pointer rounded-full px-5 py-2 text-sm font-semibold transition select-none disabled:opacity-60"
        >
          {saveState === "saving" ? "Saving…" : "Save changes"}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="bg-background border-border text-text-muted hover:bg-primary hover:text-primary-contrast cursor-pointer rounded-full border px-5 py-2 text-sm font-semibold transition select-none"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
