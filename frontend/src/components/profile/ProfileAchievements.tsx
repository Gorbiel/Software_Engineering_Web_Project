import { AchievementCard } from "@/components/achievements/AchievementCard";
import type { Achievement } from "@/utils/achievements";
import { formatRelativeTime } from "@/utils/date";

type ProfileAchievementsProps = {
  authorName: string;
  achievements: Achievement[];
  isLoading: boolean;
  error: string | null;
};

export function ProfileAchievements({
  authorName,
  achievements,
  isLoading,
  error,
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
          <AchievementCard
            key={achievement.id}
            authorName={authorName}
            title={achievement.title}
            date={`Shared ${formatRelativeTime(achievement.creation_date)}`}
            likes={0}
            comments={0}
            confirmedBy={achievement.confirmations.map((c) => c.user.name)}
          >
            {achievement.body}
          </AchievementCard>
        ))
      )}
    </div>
  );
}
