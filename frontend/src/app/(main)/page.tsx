import { PageShell } from "@/components/layout/PageShell";
import { AchievementFeed } from "@/components/feed/AchievementFeed";
import { ConfirmationsCard } from "@/components/feed/sidebar/ConfirmationsCard";
import { TopGlazersCard } from "@/components/feed/sidebar/TopGlazersCard";
import { YourTeamCard } from "@/components/feed/sidebar/YourTeamCard";

export default function Home() {
  return (
    <PageShell
      sidebar={
        <div className="hidden flex-col gap-6 xl:flex">
          <ConfirmationsCard />
          <TopGlazersCard />
          <YourTeamCard />
        </div>
      }
    >
      <AchievementFeed />
    </PageShell>
  );
}
