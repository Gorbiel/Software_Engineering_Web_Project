import { Award, Lock, Rocket } from "lucide-react";

export function BadgesCard() {
  return (
    <div className="glaze-card flex flex-col gap-4">
      <h3 className="text-text text-sm font-semibold">Badges &amp; Rewards</h3>
      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col items-center gap-1">
          <div className="bg-accent-3-soft flex h-12 w-12 items-center justify-center rounded-full">
            <Award className="text-primary h-5 w-5" />
          </div>
          <span className="text-text-muted text-[10px] font-bold">MVP</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="bg-accent-2-soft flex h-12 w-12 items-center justify-center rounded-full">
            <Rocket className="text-accent-2 h-5 w-5" />
          </div>
          <span className="text-text-muted text-[10px] font-bold">Pioneer</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="bg-background flex h-12 w-12 items-center justify-center rounded-full">
            <Lock className="text-text-muted h-5 w-5" />
          </div>
          <span className="text-text-muted text-[10px] font-bold">Hidden</span>
        </div>
      </div>
    </div>
  );
}
