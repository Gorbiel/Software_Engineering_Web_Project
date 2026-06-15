import { ChevronLeft, ChevronRight } from "lucide-react";

type SearchPaginationProps = {
  page: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
};

export function SearchPagination({
  page,
  totalPages,
  hasPrevious,
  hasNext,
  onPrevious,
  onNext,
}: SearchPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="border-border mt-3 flex items-center justify-between border-t pt-3">
      <button
        className="text-accent-2 hover:bg-background flex cursor-pointer items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold transition disabled:cursor-default disabled:opacity-40"
        type="button"
        disabled={!hasPrevious}
        onClick={onPrevious}
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
        disabled={!hasNext}
        onClick={onNext}
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
