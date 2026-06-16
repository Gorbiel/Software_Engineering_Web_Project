"use client";

import { useEffect, useState } from "react";
import { useMyProfile } from "@/context/MyProfileContext";
import {
  deleteUser,
  resetUserPassword,
  searchUsers,
  type AdminUser,
} from "@/utils/admin";
import { AdminSearchInput } from "@/components/admin/AdminSearchInput";
import { AdminUserRow } from "@/components/admin/AdminUserRow";
import { ChangeRankModal } from "@/components/admin/ChangeRankModal";
import { PasswordModal } from "@/components/settings/PasswordModal";

type SearchResult = { query: string; users: AdminUser[] };

export function AdminManageUsersSection() {
  const { profile } = useMyProfile();
  const myId = profile?.id;

  const [query, setQuery] = useState("");
  const [result, setResult] = useState<SearchResult | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deletedName, setDeletedName] = useState<string | null>(null);
  const [rankUser, setRankUser] = useState<AdminUser | null>(null);
  const [passwordUser, setPasswordUser] = useState<AdminUser | null>(null);

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

  function handleRankUpdated(userId: number | string, rank: number, rankName: string) {
    setResult((prev) =>
      prev
        ? {
            ...prev,
            users: prev.users.map((u) =>
              String(u.id) === String(userId)
                ? { ...u, rank, rank_name: rankName }
                : u,
            ),
          }
        : prev,
    );
  }

  const matches = result && result.query === trimmed ? result.users : null;

  return (
    <section className="glaze-card flex flex-col gap-6">
      <h2 className="text-text text-sm font-semibold">Manage users</h2>

      <AdminSearchInput
        id="manage-user-search"
        label="Search user"
        placeholder="Search by name or e-mail…"
        value={query}
        onChange={(value) => {
          setDeletedName(null);
          setError(null);
          setQuery(value);
        }}
      />

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
              <AdminUserRow
                key={user.id}
                user={user}
                isDeleting={deletingId === String(user.id)}
                onChangeRank={setRankUser}
                onResetPassword={setPasswordUser}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      ) : null}

      {rankUser ? (
        <ChangeRankModal
          user={rankUser}
          onClose={() => setRankUser(null)}
          onUpdated={(rank, rankName) =>
            handleRankUpdated(rankUser.id, rank, rankName)
          }
        />
      ) : null}

      {passwordUser ? (
        <PasswordModal
          title={`Reset password — ${passwordUser.name}`}
          requireCurrent={false}
          submitLabel="Reset password"
          onClose={() => setPasswordUser(null)}
          onSubmit={(values) =>
            resetUserPassword(passwordUser.id, {
              newPassword: values.newPassword,
              newPasswordConfirmation: values.newPasswordConfirmation,
            })
          }
        />
      ) : null}
    </section>
  );
}
