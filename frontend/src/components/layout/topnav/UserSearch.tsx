"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { useUserSearch } from "@/hooks/useUserSearch";
import { UserSearchSortControls } from "@/components/users/UserSearchSortControls";
import { SearchPagination } from "@/components/users/SearchPagination";
import { UserResultInfo } from "@/components/users/UserResultInfo";

export function UserSearch() {
  const {
    query,
    debouncedQuery,
    page,
    sortBy,
    order,
    activeOnly,
    results,
    isLoading,
    error,
    totalPages,
    handleQueryChange,
    handleSortChange,
    toggleOrder,
    toggleActiveOnly,
    goToPage,
  } = useUserSearch();

  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    function handleClick(event: MouseEvent) {
      if (ref.current?.contains(event.target as Node)) return;
      setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

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
          <UserSearchSortControls
            sortBy={sortBy}
            order={order}
            onSortChange={handleSortChange}
            onToggleOrder={toggleOrder}
            activeOnly={activeOnly}
            onToggleActiveOnly={toggleActiveOnly}
          />
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
                    <UserResultInfo
                      user={user}
                      avatarClassName="bg-accent-softer text-accent h-9 w-9 shrink-0 overflow-hidden text-xs font-bold"
                    />
                  </Link>
                ))}
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
      ) : null}
    </div>
  );
}
