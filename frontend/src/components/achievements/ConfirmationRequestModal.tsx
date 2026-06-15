"use client";

import { useState } from "react";
import { Check, Search, X } from "lucide-react";
import { Modal } from "@/components/misc/Modal";
import { useUserSearch } from "@/hooks/useUserSearch";
import { UserSearchSortControls } from "@/components/users/UserSearchSortControls";
import { SearchPagination } from "@/components/users/SearchPagination";
import { UserResultInfo } from "@/components/users/UserResultInfo";
import { requestAchievementConfirmation } from "@/utils/achievements";
import type { UserSearchResult } from "@/utils/users";

type ConfirmationRequestModalProps = {
  achievementId: number;
  onClose: () => void;
};

export function ConfirmationRequestModal({
  achievementId,
  onClose,
}: ConfirmationRequestModalProps) {
  const {
    query,
    hasQuery,
    page,
    sortBy,
    order,
    results,
    isLoading,
    error,
    totalPages,
    handleQueryChange,
    handleSortChange,
    toggleOrder,
    goToPage,
  } = useUserSearch({ initialActive: true });

  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(
    null,
  );
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  async function handleSend() {
    if (!selectedUser || isSending) {
      return;
    }
    setSendError(null);
    setIsSending(true);

    try {
      await requestAchievementConfirmation(achievementId, selectedUser.id);
      onClose();
    } catch (err) {
      setSendError(
        err instanceof Error ? err.message : "Unable to send request.",
      );
      setIsSending(false);
    }
  }

  return (
    <Modal
      onClose={onClose}
      ariaLabel="Request confirmation"
      backdropClassName="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4"
      panelClassName="glaze-card w-full max-w-md rounded-3xl p-5"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-text text-lg font-bold">Request confirmation</h3>
        <button
          className="text-text-muted hover:text-text hover:bg-background flex cursor-pointer items-center rounded-full p-1 transition select-none"
          type="button"
          aria-label="Close"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="bg-background text-text-muted mb-3 flex items-center rounded-full px-4 py-2">
        <input
          className="placeholder:text-text-muted w-full bg-transparent text-sm focus:outline-none"
          placeholder="Search for a teammate..."
          type="text"
          value={query}
          onChange={(event) => handleQueryChange(event.target.value)}
          autoFocus
        />
        <Search className="text-accent-2 h-5 w-5" />
      </div>

      <UserSearchSortControls
        sortBy={sortBy}
        order={order}
        onSortChange={handleSortChange}
        onToggleOrder={toggleOrder}
      />

      <div className="min-h-40">
        {!hasQuery ? (
          <p className="text-text-muted py-4 text-center text-sm">
            Search for a teammate to send a request.
          </p>
        ) : isLoading ? (
          <p className="text-text-muted py-4 text-center text-sm">Searching…</p>
        ) : error ? (
          <p className="text-text-muted py-4 text-center text-sm">{error}</p>
        ) : results && results.results.length > 0 ? (
          <>
            <div className="flex flex-col gap-2">
              {results.results.map((user) => {
                const isSelected = selectedUser?.id === user.id;
                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => setSelectedUser(user)}
                    className={`flex cursor-pointer items-center gap-3 rounded-2xl px-3 py-2 text-left transition ${
                      isSelected
                        ? "bg-accent-soft"
                        : "bg-background hover:bg-accent-softer"
                    }`}
                  >
                    <UserResultInfo
                      user={user}
                      avatarClassName="bg-accent-soft text-accent h-9 w-9 shrink-0 overflow-hidden text-xs font-bold"
                    />
                    {isSelected ? (
                      <Check className="text-accent ml-auto h-4 w-4 shrink-0" />
                    ) : null}
                  </button>
                );
              })}
            </div>

            <SearchPagination
              page={page}
              totalPages={totalPages}
              hasPrevious={Boolean(results.previous)}
              hasNext={Boolean(results.next)}
              onPrevious={() => goToPage(Math.max(1, page - 1))}
              onNext={() => goToPage(page + 1)}
            />
          </>
        ) : (
          <p className="text-text-muted py-4 text-center text-sm">
            No teammates found.
          </p>
        )}
      </div>

      {sendError ? (
        <p className="bg-accent-softer text-accent mt-3 rounded-2xl px-4 py-2 text-xs font-semibold">
          {sendError}
        </p>
      ) : null}

      <div className="mt-4 flex items-center justify-end gap-3">
        <button
          className="text-text-muted hover:text-text hover:bg-background cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition select-none disabled:cursor-not-allowed disabled:opacity-60"
          type="button"
          onClick={onClose}
          disabled={isSending}
        >
          Cancel
        </button>
        <button
          className="bg-primary text-primary-contrast hover:bg-primary-strong cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition select-none disabled:cursor-not-allowed disabled:opacity-60"
          type="button"
          onClick={handleSend}
          disabled={!selectedUser || isSending}
        >
          {isSending ? "Sending…" : "Send request"}
        </button>
      </div>
    </Modal>
  );
}
