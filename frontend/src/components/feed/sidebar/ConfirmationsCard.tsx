"use client";

import { useState } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { Avatar } from "@/components/misc/Avatar";
import { useConfirmationRequests } from "@/hooks/useConfirmationRequests";
import {
  clearConfirmationRequests,
  deleteConfirmationRequest,
} from "@/utils/achievements";

export function ConfirmationsCard() {
  const { requests, setRequests, isLoading, error } = useConfirmationRequests();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isClearing, setIsClearing] = useState(false);

  async function handleDelete(requestId: number) {
    if (deletingId !== null || isClearing) {
      return;
    }
    setDeletingId(requestId);

    try {
      await deleteConfirmationRequest(requestId);
      setRequests((prev) => prev.filter((item) => item.id !== requestId));
    } finally {
      setDeletingId(null);
    }
  }

  async function handleClearAll() {
    if (isClearing || requests.length === 0) {
      return;
    }
    setIsClearing(true);

    try {
      await clearConfirmationRequests();
      setRequests([]);
    } finally {
      setIsClearing(false);
    }
  }

  return (
    <div className="glaze-card flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-text text-sm font-semibold">Confirmations</h2>
        <div className="flex items-center gap-2">
          {requests.length > 0 ? (
            <button
              className="text-text-muted hover:text-accent hover:bg-accent-softer cursor-pointer rounded-full px-3 py-1 text-xs font-semibold transition select-none disabled:cursor-not-allowed disabled:opacity-60"
              type="button"
              onClick={handleClearAll}
              disabled={isClearing}
            >
              Clear all
            </button>
          ) : null}
          <span className="bg-accent-softer text-accent rounded-full px-2 py-1 text-xs font-semibold">
            {requests.length}
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {isLoading ? (
          <p className="text-text-muted py-2 text-center text-sm">Loading…</p>
        ) : error ? (
          <p className="text-text-muted py-2 text-center text-sm">{error}</p>
        ) : requests.length > 0 ? (
          requests.map((request) => (
            <div
              key={request.id}
              className="bg-background flex items-center gap-3 rounded-2xl p-3"
            >
              <Avatar
                name={request.requesting_user.name}
                src={request.requesting_user.profile_picture}
                className="bg-accent-soft text-accent h-9 w-9 shrink-0 overflow-hidden text-xs font-bold"
              />
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="text-text truncate text-sm font-semibold">
                  {request.achievement_title}
                </span>
                <Link
                  href={`/profile/${request.requesting_user.id}`}
                  className="text-text-muted truncate text-xs hover:underline"
                >
                  {request.requesting_user.name}
                </Link>
              </div>
              <button
                className="text-text-muted hover:text-accent hover:bg-accent-softer flex shrink-0 cursor-pointer items-center rounded-full p-2 transition select-none disabled:cursor-not-allowed disabled:opacity-60"
                type="button"
                aria-label="Delete request"
                onClick={() => handleDelete(request.id)}
                disabled={deletingId !== null || isClearing}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))
        ) : (
          <p className="text-text-muted py-2 text-center text-sm">
            No pending requests.
          </p>
        )}
      </div>
    </div>
  );
}
