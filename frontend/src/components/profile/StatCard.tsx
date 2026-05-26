import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  icon: LucideIcon;
  label: string;
  children: React.ReactNode;
};

export function StatCard({ icon: Icon, label, children }: StatCardProps) {
  return (
    <div className="glaze-card flex flex-col items-center gap-2 text-center">
      <Icon className="text-primary h-8 w-8" />
      {children}
      <span className="text-text-muted text-xs font-semibold">{label}</span>
    </div>
  );
}
