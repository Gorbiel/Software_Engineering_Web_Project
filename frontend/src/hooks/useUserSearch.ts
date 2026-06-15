import { useEffect, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import {
  searchUsers,
  type PaginatedResponse,
  type UserSearchResult,
} from "@/utils/users";

export type SortBy = "name" | "creation_date" | "email";
export type Order = "asc" | "desc";

export const SORT_LABELS: Record<SortBy, string> = {
  name: "Name",
  creation_date: "Newest",
  email: "Email",
};

type UseUserSearchOptions = {
  pageSize?: number;
  // When true, only active users are searched and the "Active" filter starts on.
  initialActive?: boolean;
};

export function useUserSearch({
  pageSize = 5,
  initialActive = false,
}: UseUserSearchOptions = {}) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [results, setResults] =
    useState<PaginatedResponse<UserSearchResult> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>("name");
  const [order, setOrder] = useState<Order>("asc");
  const [activeOnly, setActiveOnly] = useState(initialActive);

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
    if (!debouncedQuery) {
      return;
    }

    let ignore = false;

    searchUsers({
      q: debouncedQuery,
      page,
      pageSize,
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
  }, [debouncedQuery, page, sortBy, order, activeOnly, pageSize]);

  const totalPages = results ? Math.ceil(results.count / pageSize) : 0;

  return {
    query,
    debouncedQuery,
    hasQuery,
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
  };
}
