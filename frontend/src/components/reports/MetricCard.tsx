type MetricCardProps = {
  label: string;
  value: number | string;
};

export function MetricCard({ label, value }: MetricCardProps) {
  return (
    <div className="bg-background flex flex-col items-center gap-1 rounded-2xl px-4 py-3 text-center">
      <span className="text-primary text-3xl font-black">{value}</span>
      <span className="text-text-muted text-[10px] font-black uppercase">
        {label}
      </span>
    </div>
  );
}
