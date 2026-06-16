export type RankingRow = {
  key: string | number;
  label: string;
  sublabel?: string;
  value: number | string;
};

type RankingTableProps = {
  rows: RankingRow[];
  emptyText?: string;
};

export function RankingTable({
  rows,
  emptyText = "No data for this period.",
}: RankingTableProps) {
  if (rows.length === 0) {
    return <p className="text-text-muted text-sm">{emptyText}</p>;
  }

  return (
    <ol className="flex flex-col gap-0.5">
      {rows.map((row, index) => (
        <li
          key={row.key}
          className="hover:bg-background flex items-center gap-3 rounded-2xl px-2 py-1.5"
        >
          <span className="text-text-muted w-5 shrink-0 text-right text-xs font-bold">
            {index + 1}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-text truncate text-sm font-semibold">
              {row.label}
            </p>
            {row.sublabel ? (
              <p className="text-text-muted truncate text-xs">{row.sublabel}</p>
            ) : null}
          </div>
          <span className="text-primary shrink-0 text-sm font-bold">
            {row.value}
          </span>
        </li>
      ))}
    </ol>
  );
}
