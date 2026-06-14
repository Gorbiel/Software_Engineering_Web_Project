import { AchievementFeed } from "@/components/feed/AchievementFeed";
import { ConfirmationsCard } from "@/components/feed/sidebar/ConfirmationsCard";
import { TopGlazersCard } from "@/components/feed/sidebar/TopGlazersCard";
import { ConfirmationRequestsProvider } from "@/context/ConfirmationRequestsContext";

export default function Home() {
  return (
    <ConfirmationRequestsProvider>
      <div className="flex flex-col gap-6 xl:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <AchievementFeed
            belowInput={
              <ConfirmationsCard className="xl:hidden" hideWhenEmpty />
            }
          />
        </div>
        <aside className="hidden flex-col gap-6 xl:sticky xl:top-6 xl:flex xl:max-h-[calc(100dvh-7rem)] xl:w-(--layout-sidebar-right) xl:self-start xl:overflow-y-auto">
          <ConfirmationsCard />
          <TopGlazersCard />
        </aside>
      </div>
    </ConfirmationRequestsProvider>
  );
}
