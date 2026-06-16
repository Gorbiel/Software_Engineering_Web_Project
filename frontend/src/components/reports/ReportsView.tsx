"use client";

import { useState } from "react";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useLedTeams } from "@/hooks/useLedTeams";
import { GeneralReportView } from "@/components/reports/GeneralReportView";
import { UserReportView } from "@/components/reports/UserReportView";
import { TeamReportView } from "@/components/reports/TeamReportView";

type Tab = "general" | "user" | "team";

const TAB_LABELS: Record<Tab, string> = {
  general: "Organisation",
  user: "Individual",
  team: "Team",
};

export function ReportsView() {
  const isAdmin = useIsAdmin();
  const ledTeams = useLedTeams();
  const [activeTab, setActiveTab] = useState<Tab>("general");

  if (isAdmin === null || ledTeams === null) {
    return <p className="text-text-muted text-sm">Loading…</p>;
  }

  const isLeader = ledTeams.length > 0;

  if (!isAdmin && !isLeader) {
    return (
      <div className="glaze-card">
        <p className="text-text-muted text-sm">
          You don&apos;t have access to reports.
        </p>
      </div>
    );
  }

  const tabs: Tab[] = isAdmin ? ["general", "user", "team"] : ["team"];
  const currentTab = tabs.includes(activeTab) ? activeTab : tabs[0];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-text text-2xl font-black">Reports</h1>
        <p className="text-text-muted text-sm">
          Engagement insights across the chosen period.
        </p>
      </div>

      {tabs.length > 1 ? (
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const active = tab === currentTab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`cursor-pointer rounded-full px-4 py-2 text-sm font-bold transition select-none ${
                  active
                    ? "bg-primary text-primary-contrast"
                    : "bg-surface text-text-muted hover:bg-background"
                }`}
              >
                {TAB_LABELS[tab]}
              </button>
            );
          })}
        </div>
      ) : null}

      {currentTab === "general" ? <GeneralReportView /> : null}
      {currentTab === "user" ? <UserReportView /> : null}
      {currentTab === "team" ? (
        <TeamReportView isAdmin={isAdmin} ledTeams={ledTeams} />
      ) : null}
    </div>
  );
}
