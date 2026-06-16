"use client";

import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";

export type SearchOption = {
  id: number;
  label: string;
  sublabel?: string;
};

type SearchSelectProps = {
  placeholder: string;
  search: (query: string) => Promise<SearchOption[]>;
  selected: SearchOption | null;
  onSelect: (option: SearchOption) => void;
  onClear: () => void;
};

export function SearchSelect({
  placeholder,
  search,
  selected,
  onSelect,
  onClear,
}: SearchSelectProps) {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<{
    query: string;
    options: SearchOption[];
  } | null>(null);
  const debouncedQuery = useDebounce(query.trim(), 350);

  useEffect(() => {
    if (!debouncedQuery) {
      return;
    }

    let ignore = false;
    search(debouncedQuery)
      .then((options) => {
        if (!ignore) setResult({ query: debouncedQuery, options });
      })
      .catch(() => {
        if (!ignore) setResult({ query: debouncedQuery, options: [] });
      });

    return () => {
      ignore = true;
    };
  }, [debouncedQuery, search]);

  const isLoading =
    debouncedQuery.length > 0 && result?.query !== debouncedQuery;
  const options = result?.query === debouncedQuery ? result.options : [];

  if (selected) {
    return (
      <div className="bg-accent-2-soft text-accent-2 flex w-full max-w-sm items-center justify-between gap-2 rounded-2xl px-4 py-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold">{selected.label}</p>
          {selected.sublabel ? (
            <p className="truncate text-xs opacity-80">{selected.sublabel}</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onClear}
          className="hover:bg-background cursor-pointer rounded-full p-1 transition"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-sm">
      <div className="border-border bg-background flex items-center gap-2 rounded-2xl border px-3 py-2">
        <Search className="text-text-muted h-4 w-4 shrink-0" />
        <input
          type="text"
          value={query}
          placeholder={placeholder}
          onChange={(event) => setQuery(event.target.value)}
          className="text-text placeholder:text-text-muted w-full bg-transparent text-sm outline-none"
        />
      </div>
      {query.trim() ? (
        <div className="glaze-card absolute z-10 mt-2 flex max-h-64 w-full flex-col gap-0.5 overflow-y-auto rounded-3xl p-2">
          {isLoading ? (
            <p className="text-text-muted px-2 py-1.5 text-sm">Searching…</p>
          ) : options.length === 0 ? (
            <p className="text-text-muted px-2 py-1.5 text-sm">No results.</p>
          ) : (
            options.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  onSelect(option);
                  setQuery("");
                }}
                className="hover:bg-background flex cursor-pointer flex-col rounded-2xl px-3 py-2 text-left transition"
              >
                <span className="text-text truncate text-sm font-semibold">
                  {option.label}
                </span>
                {option.sublabel ? (
                  <span className="text-text-muted truncate text-xs">
                    {option.sublabel}
                  </span>
                ) : null}
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
