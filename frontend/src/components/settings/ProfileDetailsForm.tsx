"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { saveUser } from "@/utils/auth";
import { fetchMyProfile, updateMyProfile } from "@/utils/profile";

type SaveState = "idle" | "saving" | "saved" | "error";

export function ProfileDetailsForm() {
  const { user } = useAuth();
  const router = useRouter();

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [jobTitle, setJobTitle] = useState("");
  const [bio, setBio] = useState("");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load the fields that aren't kept in the local session (job title, bio).
  useEffect(() => {
    let active = true;

    fetchMyProfile()
      .then((profile) => {
        if (!active) {
          return;
        }
        setName(profile.name);
        setEmail(profile.email);
        setJobTitle(profile.job_title ?? "");
        setBio(profile.bio_text ?? "");
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setSaveState("saving");
    setErrorMsg(null);

    try {
      const updated = await updateMyProfile({
        name,
        email,
        job_title: jobTitle.trim() === "" ? null : jobTitle.trim(),
        bio_text: bio.trim() === "" ? null : bio.trim(),
      });
      saveUser({ id: updated.id, name: updated.name, email: updated.email });
      setSaveState("saved");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to save.");
      setSaveState("error");
    }
  }

  function handleCancel() {
    router.push("/profile");
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
            <label
              htmlFor="job-title"
              className="text-text-muted ml-3 text-xs font-semibold"
            >
              Job title
            </label>
            <input
              id="job-title"
              className="bg-background text-text rounded-2xl px-4 py-2 text-sm focus:outline-none"
              type="text"
              value={jobTitle}
              onChange={(e) => {
                setSaveState("idle");
                setJobTitle(e.target.value);
              }}
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label
            htmlFor="bio"
            className="text-text-muted ml-3 text-xs font-semibold"
          >
            Bio
          </label>
          <textarea
            id="bio"
            className="bg-background text-text min-h-28 resize-none rounded-2xl px-3 py-2 text-sm focus:outline-none"
            value={bio}
            onChange={(e) => {
              setSaveState("idle");
              setBio(e.target.value);
            }}
          />
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
