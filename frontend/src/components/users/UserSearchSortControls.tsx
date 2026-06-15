import { ArrowDown, ArrowUp } from "lucide-react";
import { SORT_LABELS, type Order, type SortBy } from "@/hooks/useUserSearch";

type UserSearchSortControlsProps = {
  sortBy: SortBy;
  order: Order;
  onSortChange: (value: SortBy) => void;
  onToggleOrder: () => void;
  // Provide both to render the optional "Active" filter toggle.
  activeOnly?: boolean;
  onToggleActiveOnly?: () => void;
};

export function UserSearchSortControls({
  sortBy,
  order,
  onSortChange,
  onToggleOrder,
  activeOnly,
  onToggleActiveOnly,
}: UserSearchSortControlsProps) {
  return (
    <div className="border-border mb-3 flex items-center gap-2 border-b pb-3">
      <label className="text-text-muted flex items-center gap-1 text-xs font-semibold">
        Sort
        <select
          className="bg-background text-text cursor-pointer rounded-full px-2 py-1 text-xs font-semibold focus:outline-none"
          value={sortBy}
          onChange={(event) => onSortChange(event.target.value as SortBy)}
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
        onClick={onToggleOrder}
      >
        {order === "asc" ? (
          <ArrowUp className="h-4 w-4" />
        ) : (
          <ArrowDown className="h-4 w-4" />
        )}
      </button>
      {onToggleActiveOnly ? (
        <button
          className={`ml-auto cursor-pointer rounded-full px-3 py-1 text-xs font-semibold transition ${
            activeOnly
              ? "bg-accent-soft text-accent"
              : "bg-background text-text-muted"
          }`}
          type="button"
          aria-pressed={activeOnly}
          onClick={onToggleActiveOnly}
        >
          Active
        </button>
      ) : null}
    </div>
  );
}
