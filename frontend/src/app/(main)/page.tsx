import { PageShell } from "@/components/layout/PageShell";
import { AchievementCard } from "@/components/achievements/AchievementCard";
import { AchievementInput } from "@/components/feed/AchievementInput";
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
      <AchievementInput />

      <AchievementCard
        authorName="Jordan Smyth"
        title="Shipped the new login flow"
        date="Shared 3 hours ago"
        likes={12}
        comments={4}
      >
        After two weeks of polish, the new login flow is live. Conversion is
        already up 8% in the first hours — huge thanks to QA for catching that
        edge case with empty passwords on Safari.
      </AchievementCard>

      <AchievementCard
        authorName="Maya Lee"
        title="Mentored a new hire to their first PR"
        date="Shared yesterday"
        likes={27}
        comments={9}
      >
        Onboarded Diego this week and he just shipped his first PR to the
        design tokens repo. Watching the lightbulb moments is honestly the best
        part of this job. #mentoring
      </AchievementCard>
    </PageShell>
  );
}
