"use client";

import { useState } from "react";
import {
  type DateRange,
  defaultDateRange,
  fetchTeamReport,
} from "@/utils/reports";
import { useKeyedReport } from "@/hooks/useKeyedReport";
import { type Team, searchTeams } from "@/utils/teams";
import { DateRangeControls } from "@/components/reports/DateRangeControls";
import { ReportPanel } from "@/components/reports/ReportPanel";
import { ReportSection } from "@/components/reports/ReportSection";
import { MetricCard } from "@/components/reports/MetricCard";
import { DailyBars } from "@/components/reports/DailyBars";
import { RankingTable } from "@/components/reports/RankingTable";
import {
  SearchSelect,
  type SearchOption,
} from "@/components/reports/SearchSelect";

const gridClass = "grid grid-cols-1 gap-4 md:grid-cols-2";

async function searchTeamOptions(query: string): Promise<SearchOption[]> {
  const teams = await searchTeams(query);
  return teams.map((team) => ({ id: team.id, label: team.name }));
}

type TeamReportViewProps = {
  isAdmin: boolean;
  ledTeams: Team[];
};

export function TeamReportView({ isAdmin, ledTeams }: TeamReportViewProps) {
  const [range, setRange] = useState<DateRange>(defaultDateRange);
  const [selected, setSelected] = useState<SearchOption | null>(() =>
    !isAdmin && ledTeams.length > 0
      ? { id: ledTeams[0].id, label: ledTeams[0].name }
      : null,
  );
  const { from, to } = range;
  const teamId = selected?.id ?? null;
  const key = teamId !== null && from && to ? `${teamId}|${from}|${to}` : null;
  const {
    data: report,
    isLoading,
    error,
  } = useKeyedReport(key, () =>
    fetchTeamReport(teamId as number, { from, to }),
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end gap-4">
        {isAdmin ? (
          <SearchSelect
            placeholder="Search for a team…"
            search={searchTeamOptions}
            selected={selected}
            onSelect={setSelected}
            onClear={() => setSelected(null)}
          />
        ) : (
          <div className="flex flex-wrap gap-2">
            {ledTeams.map((team) => {
              const active = selected?.id === team.id;
              return (
                <button
                  key={team.id}
                  type="button"
                  onClick={() => setSelected({ id: team.id, label: team.name })}
                  className={`cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition select-none ${
                    active
                      ? "bg-accent-2-soft text-accent-2"
                      : "bg-surface text-text-muted hover:bg-background"
                  }`}
                >
                  {team.name}
                </button>
              );
            })}
          </div>
        )}
        <DateRangeControls range={range} onChange={setRange} />
      </div>

      <ReportPanel
        isLoading={isLoading}
        error={error}
        hasData={!!report}
        placeholder={
          <p className="text-text-muted text-sm">
            Pick a team to see its report.
          </p>
        }
      >
        {report ? (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <MetricCard label="Achievements" value={report.achievements_count} />
              <MetricCard
                label="Confirmations"
                value={report.confirmations_count}
              />
              <MetricCard
                label="Glazes sent"
                value={report.glazes_sent_count}
              />
              <MetricCard
                label="Glazes received"
                value={report.glazes_received_count}
              />
              <MetricCard
                label="Participation"
                value={`${Math.round(report.participation_rate ?? 0)}%`}
              />
              <MetricCard
                label="Cross-team recv"
                value={report.cross_team_glazes_received}
              />
              <MetricCard
                label="Cross-team sent"
                value={report.cross_team_glazes_sent}
              />
            </div>

            <div className={gridClass}>
              <ReportSection title="Achievements / day">
                <DailyBars
                  data={report.daily_achievement_counts.map((row) => ({
                    day: row.day,
                    value: row.total,
                  }))}
                />
              </ReportSection>
              <ReportSection title="Confirmations / day">
                <DailyBars
                  data={report.daily_achievement_confirmations.map((row) => ({
                    day: row.day,
                    value: row.total,
                  }))}
                />
              </ReportSection>
              <ReportSection title="Reactions / day">
                <DailyBars
                  data={report.daily_achievement_reactions.map((row) => ({
                    day: row.day,
                    value: row.total,
                  }))}
                />
              </ReportSection>
              <ReportSection title="Active users / day">
                <DailyBars
                  data={report.active_user_daily_count.map((row) => ({
                    day: row.day,
                    value: row.active_users,
                  }))}
                />
              </ReportSection>
            </div>

            <div className={gridClass}>
              <ReportSection title="Most glazed members">
                <RankingTable
                  rows={report.most_glazed_users.map((row) => ({
                    key: row.id,
                    label: row.name,
                    sublabel: row.email,
                    value: row.received_glaze_count,
                  }))}
                />
              </ReportSection>
              <ReportSection title="Top glazing members">
                <RankingTable
                  rows={report.best_glazing_users.map((row) => ({
                    key: row.id,
                    label: row.name,
                    sublabel: row.email,
                    value: row.sent_glaze_count,
                  }))}
                />
              </ReportSection>
              <ReportSection title="Top achievement tags">
                <RankingTable
                  rows={report.top_achievement_tags_used_by_team.map((row) => ({
                    key: row.tag_text,
                    label: `#${row.tag_text}`,
                    value: row.usage_count,
                  }))}
                />
              </ReportSection>
              <ReportSection title="Top glaze tags (sent)">
                <RankingTable
                  rows={report.top_glaze_tags_used_by_team.map((row) => ({
                    key: row.tag_text,
                    label: `#${row.tag_text}`,
                    value: row.usage_count,
                  }))}
                />
              </ReportSection>
              <ReportSection title="Top glaze tags (received)">
                <RankingTable
                  rows={report.top_glaze_tags_recieved_by_team.map((row) => ({
                    key: row.tag_text,
                    label: `#${row.tag_text}`,
                    value: row.usage_count,
                  }))}
                />
              </ReportSection>
            </div>
          </div>
        ) : null}
      </ReportPanel>
    </div>
  );
}
