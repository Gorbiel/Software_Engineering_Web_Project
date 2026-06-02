import { AchievementItem } from "@/components/achievements/AchievementItem";
import type { Achievement } from "@/utils/achievements";

type ProfileAchievementsProps = {
  currentUserId: number | string | undefined;
  achievements: Achievement[];
  isLoading: boolean;
  error: string | null;
  onChanged: (achievement: Achievement) => void;
  onDeleted: (id: number) => void;
};

export function ProfileAchievements({
  currentUserId,
  achievements,
  isLoading,
  error,
  onChanged,
  onDeleted,
}: ProfileAchievementsProps) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-text text-base font-semibold">My Achievements</h2>

      {isLoading ? (
        <p className="text-text-muted px-1 text-sm">Loading achievements…</p>
      ) : error ? (
        <p className="bg-accent-softer text-accent rounded-2xl px-4 py-3 text-sm font-semibold">
          {error}
        </p>
      ) : achievements.length === 0 ? (
        <p className="text-text-muted px-1 text-sm">No achievements yet.</p>
      ) : (
        achievements.map((achievement) => (
          <AchievementItem
            key={achievement.id}
            achievement={achievement}
            currentUserId={currentUserId}
            onChanged={onChanged}
            onDeleted={onDeleted}
          />
        ))
      )}
    </div>
  );
}
