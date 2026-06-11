"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import { Avatar } from "@/components/misc/Avatar";
import { useDebounce } from "@/hooks/useDebounce";
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

export function UserSearch() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] =
    useState<PaginatedResponse<UserSearchResult> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>("name");
  const [order, setOrder] = useState<Order>("asc");
  const [activeOnly, setActiveOnly] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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

  function toggleActiveOnly() {
    setActiveOnly((current) => !current);
    setPage(1);
    setIsLoading(hasQuery);
  }

  function goToPage(next: number) {
    setPage(next);
    setIsLoading(true);
  }

  useEffect(() => {
    if (!isOpen) return;
    function handleClick(event: MouseEvent) {
      if (ref.current?.contains(event.target as Node)) return;
      setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  useEffect(() => {
    if (!debouncedQuery) return;

    let ignore = false;

    searchUsers({
      q: debouncedQuery,
      page,
      pageSize: PAGE_SIZE,
      sortBy,
      order,
      active: activeOnly ? true : undefined,
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
  }, [debouncedQuery, page, sortBy, order, activeOnly]);

  const totalPages = results ? Math.ceil(results.count / PAGE_SIZE) : 0;
  const showDropdown = isOpen && debouncedQuery.length > 0;

  return (
    <div className="relative hidden md:block" ref={ref}>
      <div className="bg-background text-text-muted flex items-center rounded-full px-4 py-2 transition-all select-none">
        <input
          className="placeholder:text-text-muted w-72 bg-transparent text-sm focus:outline-none"
          placeholder="Search for a teammate..."
          type="text"
          value={query}
          onChange={(event) => handleQueryChange(event.target.value)}
          onFocus={() => setIsOpen(true)}
        />
        <button
          className="text-accent-2 hover:bg-background cursor-pointer rounded-full transition"
          type="button"
          aria-label="Search"
          onClick={() => setIsOpen(true)}
        >
          <Search className="h-5 w-5" />
        </button>
      </div>

      {showDropdown ? (
        <div className="glaze-card absolute top-12 left-0 z-30 w-80 rounded-3xl p-4">
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
              aria-label={
                order === "asc" ? "Sort ascending" : "Sort descending"
              }
              onClick={toggleOrder}
            >
              {order === "asc" ? (
                <ArrowUp className="h-4 w-4" />
              ) : (
                <ArrowDown className="h-4 w-4" />
              )}
            </button>
            <button
              className={`ml-auto cursor-pointer rounded-full px-3 py-1 text-xs font-semibold transition ${
                activeOnly
                  ? "bg-accent-soft text-accent"
                  : "bg-background text-text-muted"
              }`}
              type="button"
              aria-pressed={activeOnly}
              onClick={toggleActiveOnly}
            >
              Active
            </button>
          </div>
          {isLoading ? (
            <p className="text-text-muted py-4 text-center text-sm">
              Searching…
            </p>
          ) : error ? (
            <p className="text-text-muted py-4 text-center text-sm">{error}</p>
          ) : results && results.results.length > 0 ? (
            <>
              <div className="flex flex-col gap-2">
                {results.results.map((user) => (
                  <Link
                    key={user.id}
                    href={`/profile/${user.id}`}
                    onClick={() => setIsOpen(false)}
                    className="bg-background flex items-center gap-3 rounded-2xl px-3 py-2 transition"
                  >
                    <Avatar
                      name={user.name}
                      src={user.profile_picture}
                      className="bg-accent-softer text-accent h-9 w-9 shrink-0 overflow-hidden text-xs font-bold"
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
                  </Link>
                ))}
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
      ) : null}
    </div>
  );
}
