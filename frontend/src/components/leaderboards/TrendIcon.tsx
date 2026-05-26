import { TrendingDown, TrendingUp } from "lucide-react";
import type { Trend } from "./types";

export function TrendIcon({ trend }: { trend: Trend }) {
  if (trend === "up") return <TrendingUp className="text-accent-2 h-4 w-4" />;
  if (trend === "down") return <TrendingDown className="text-accent h-4 w-4" />;
  return <span className="text-text-muted text-[10px] font-semibold">—</span>;
}
