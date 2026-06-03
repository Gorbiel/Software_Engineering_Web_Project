"use client";

import { useEffect, useState } from "react";
import { Avatar } from "@/components/misc/Avatar";
import { useMyProfile } from "@/context/MyProfileContext";
import {
  fetchMyProfile,
  removeProfilePicture,
  updateProfilePicture,
} from "@/utils/profile";

const ACCEPTED_TYPES = ["image/png", "image/jpeg"];
const MAX_BYTES = 2 * 1024 * 1024;

export function ProfilePhotoSection() {
  const { setProfile } = useMyProfile();
  const [name, setName] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    fetchMyProfile()
      .then((profile) => {
        if (active) {
          setName(profile.name);
          setPhotoUrl(profile.profile_picture);
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) {
      return;
    }

    setError(null);

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Use a PNG or JPG image.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Image must be 2MB or smaller.");
      return;
    }

    setIsBusy(true);
    try {
      const updated = await updateProfilePicture(file);
      setPhotoUrl(updated.profile_picture);
      setProfile(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't upload photo.");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleRemove() {
    if (isBusy || !photoUrl) {
      return;
    }
    setError(null);
    setIsBusy(true);
    try {
      const updated = await removeProfilePicture();
      setPhotoUrl(updated.profile_picture);
      setProfile(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't remove photo.");
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <section className="glaze-card flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar
            name={name}
            src={photoUrl}
            alt="Profile photo"
            className="bg-accent-2-soft text-accent-2 h-20 w-20 text-lg font-bold"
          />
          <div className="flex flex-col gap-1">
            <p className="text-text text-sm font-semibold">Profile photo</p>
            <p className="text-text-muted text-xs">PNG or JPG up to 2MB.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <label
            className={`bg-primary text-primary-contrast hover:bg-primary-strong rounded-full px-4 py-2 text-xs font-semibold transition select-none ${
              isBusy ? "cursor-not-allowed opacity-60" : "cursor-pointer"
            }`}
          >
            {isBusy ? "Uploading…" : "Change photo"}
            <input
              className="sr-only"
              type="file"
              accept="image/png,image/jpeg"
              disabled={isBusy}
              onChange={handleFileChange}
            />
          </label>
          <button
            type="button"
            onClick={handleRemove}
            disabled={isBusy || !photoUrl}
            className="bg-background border-border text-text-muted hover:bg-primary hover:text-primary-contrast cursor-pointer rounded-full border px-4 py-2 text-xs font-semibold transition select-none disabled:cursor-not-allowed disabled:opacity-60"
          >
            Remove
          </button>
        </div>
      </div>

      {error ? (
        <p className="bg-accent-softer text-accent rounded-2xl px-4 py-2 text-xs font-semibold">
          {error}
        </p>
      ) : null}
    </section>
  );
}
