"use client";

import { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
} from "lucide-react";
import { Avatar } from "@/components/misc/Avatar";
import { useDebounce } from "@/hooks/useDebounce";
import { requestAchievementConfirmation } from "@/utils/achievements";
import {
  searchUsers,
  type PaginatedResponse,
  type UserSearchResult,
} from "@/utils/users";

const PAGE_SIZE = 5;

type SortBy = "name" | "creation_date" | "email";
type Order = "asc" | "desc";

const SORT_LABELS: Record<SortBy, string> = {
  name: "Name",
  creation_date: "Newest",
  email: "Email",
};

type ConfirmationRequestModalProps = {
  achievementId: number;
  onClose: () => void;
};

export function ConfirmationRequestModal({
  achievementId,
  onClose,
}: ConfirmationRequestModalProps) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [results, setResults] =
    useState<PaginatedResponse<UserSearchResult> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>("name");
  const [order, setOrder] = useState<Order>("asc");
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(
    null,
  );
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const debouncedQuery = useDebounce(query.trim(), 350);
  const hasQuery = query.trim().length > 0;

  function handleQueryChange(value: string) {
    setQuery(value);
    setPage(1);
    setIsLoading(value.trim().length > 0);
  }

  function handleSortChange(value: SortBy) {
    setSortBy(value);
    setPage(1);
    setIsLoading(hasQuery);
  }

  function toggleOrder() {
    setOrder((current) => (current === "asc" ? "desc" : "asc"));
    setPage(1);
    setIsLoading(hasQuery);
  }

  function goToPage(next: number) {
    setPage(next);
    setIsLoading(true);
  }

  useEffect(() => {
    if (!debouncedQuery) {
      setResults(null);
      setIsLoading(false);
      return;
    }

    let ignore = false;

    searchUsers({
      q: debouncedQuery,
      page,
      pageSize: PAGE_SIZE,
      sortBy,
      order,
      active: true,
    })
      .then((data) => {
        if (ignore) return;
        setResults(data);
        setError(null);
      })
      .catch(() => {
        if (ignore) return;
        setResults(null);
        setError("Could not load results.");
      })
      .finally(() => {
        if (ignore) return;
        setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [debouncedQuery, page, sortBy, order]);

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

  const totalPages = results ? Math.ceil(results.count / PAGE_SIZE) : 0;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="glaze-card w-full max-w-md rounded-3xl p-5">
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

        <div className="border-border mb-3 flex items-center gap-2 border-b pb-3">
          <label className="text-text-muted flex items-center gap-1 text-xs font-semibold">
            Sort
            <select
              className="bg-background text-text cursor-pointer rounded-full px-2 py-1 text-xs font-semibold focus:outline-none"
              value={sortBy}
              onChange={(event) =>
                handleSortChange(event.target.value as SortBy)
              }
            >
              {(Object.keys(SORT_LABELS) as SortBy[]).map((option) => (
                <option key={option} value={option}>
                  {SORT_LABELS[option]}
                </option>
              ))}
            </select>
          </label>
          <button
            className="text-accent-2 hover:bg-background flex cursor-pointer items-center rounded-full p-1 transition"
            type="button"
            aria-label={order === "asc" ? "Sort ascending" : "Sort descending"}
            onClick={toggleOrder}
          >
            {order === "asc" ? (
              <ArrowUp className="h-4 w-4" />
            ) : (
              <ArrowDown className="h-4 w-4" />
            )}
          </button>
        </div>

        <div className="min-h-40">
          {!hasQuery ? (
            <p className="text-text-muted py-4 text-center text-sm">
              Search for a teammate to send a request.
            </p>
          ) : isLoading ? (
            <p className="text-text-muted py-4 text-center text-sm">
              Searching…
            </p>
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
                      className={`flex items-center gap-3 rounded-2xl px-3 py-2 text-left transition cursor-pointer ${
                        isSelected
                          ? "bg-accent-soft"
                          : "bg-background hover:bg-accent-softer"
                      }`}
                    >
                      <Avatar
                        name={user.name}
                        src={user.profile_picture}
                        className="bg-accent-soft text-accent h-9 w-9 shrink-0 overflow-hidden text-xs font-bold"
                      />
                      <div className="flex min-w-0 flex-col">
                        <span className="text-text truncate text-sm font-semibold">
                          {user.name}
                        </span>
                        {user.job_title ? (
                          <span className="text-text-muted truncate text-xs">
                            {user.job_title}
                          </span>
                        ) : null}
                      </div>
                      {isSelected ? (
                        <Check className="text-accent ml-auto h-4 w-4 shrink-0" />
                      ) : null}
                    </button>
                  );
                })}
              </div>

              {totalPages > 1 ? (
                <div className="border-border mt-3 flex items-center justify-between border-t pt-3">
                  <button
                    className="text-accent-2 hover:bg-background flex cursor-pointer items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold transition disabled:cursor-default disabled:opacity-40"
                    type="button"
                    disabled={!results.previous}
                    onClick={() => goToPage(Math.max(1, page - 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Prev
                  </button>
                  <span className="text-text-muted text-xs font-semibold">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    className="text-accent-2 hover:bg-background flex cursor-pointer items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold transition disabled:cursor-default disabled:opacity-40"
                    type="button"
                    disabled={!results.next}
                    onClick={() => goToPage(page + 1)}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              ) : null}
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
      </div>
    </div>
  );
}
