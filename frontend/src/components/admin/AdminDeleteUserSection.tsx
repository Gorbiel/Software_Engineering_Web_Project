"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { useMyProfile } from "@/context/MyProfileContext";
import { deleteUser, searchUsers, type AdminUser } from "@/utils/admin";

type SearchResult = { query: string; users: AdminUser[] };

export function AdminDeleteUserSection() {
  const { profile } = useMyProfile();
  const myId = profile?.id;

  const [query, setQuery] = useState("");
  const [result, setResult] = useState<SearchResult | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deletedName, setDeletedName] = useState<string | null>(null);

  const trimmed = query.trim();

  useEffect(() => {
    if (trimmed === "") {
      return;
    }

    let active = true;
    const timer = setTimeout(() => {
      searchUsers(trimmed)
        .then((users) => {
          if (active) {
            setResult({
              query: trimmed,
              users: users.filter((u) => String(u.id) !== String(myId)),
            });
          }
        })
        .catch(() => {
          if (active) {
            setResult({ query: trimmed, users: [] });
          }
        });
    }, 300);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [trimmed, myId]);

  async function handleDelete(user: AdminUser) {
    if (
      !window.confirm(
        `Delete the account for ${user.name}? This deactivates the account.`,
      )
    ) {
      return;
    }

    setDeletingId(String(user.id));
    setError(null);
    setDeletedName(null);

    try {
      await deleteUser(user.id);
      setResult((prev) =>
        prev
          ? {
              ...prev,
              users: prev.users.filter((u) => String(u.id) !== String(user.id)),
            }
          : prev,
      );
      setDeletedName(user.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete.");
    } finally {
      setDeletingId(null);
    }
  }

  const matches = result && result.query === trimmed ? result.users : null;

  return (
    <section className="glaze-card flex flex-col gap-6">
      <h2 className="text-text text-sm font-semibold">Delete user account</h2>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="delete-user-search"
          className="text-text-muted ml-3 text-xs font-semibold"
        >
          Search user
        </label>
        <div className="bg-background flex items-center gap-2 rounded-2xl px-4 py-2">
          <Search className="text-text-muted h-4 w-4 shrink-0" />
          <input
            id="delete-user-search"
            className="text-text w-full bg-transparent text-sm focus:outline-none"
            type="text"
            placeholder="Search by name or e-mail…"
            value={query}
            onChange={(e) => {
              setDeletedName(null);
              setError(null);
              setQuery(e.target.value);
            }}
          />
        </div>
      </div>

      {error ? (
        <p className="bg-accent-softer text-accent rounded-2xl px-4 py-2 text-xs font-semibold">
          {error}
        </p>
      ) : null}

      {deletedName ? (
        <p className="bg-accent-2-soft text-accent-2 rounded-2xl px-4 py-2 text-xs font-semibold">
          Deleted the account for {deletedName}.
        </p>
      ) : null}

      {trimmed !== "" ? (
        <div className="flex flex-col gap-2">
          {matches === null ? (
            <p className="text-text-muted px-3 py-2 text-sm">Searching…</p>
          ) : matches.length === 0 ? (
            <p className="text-text-muted px-3 py-2 text-sm">No users found.</p>
          ) : (
            matches.map((user) => (
              <div
                key={user.id}
                className="bg-background flex items-center justify-between gap-3 rounded-2xl px-4 py-2"
              >
                <div className="flex min-w-0 flex-col">
                  <span className="text-text truncate text-sm font-semibold">
                    {user.name}
                  </span>
                  <span className="text-text-muted truncate text-xs">
                    {user.email}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(user)}
                  disabled={deletingId === String(user.id)}
                  className="bg-accent text-primary-contrast shrink-0 cursor-pointer rounded-full px-4 py-1.5 text-xs font-semibold transition select-none hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deletingId === String(user.id) ? "Deleting…" : "Delete"}
                </button>
              </div>
            ))
          )}
        </div>
      ) : null}
    </section>
  );
}
