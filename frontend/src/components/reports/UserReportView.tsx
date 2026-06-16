"use client";

import { useState } from "react";
import {
  type DateRange,
  defaultDateRange,
  fetchUserReport,
} from "@/utils/reports";
import { useKeyedReport } from "@/hooks/useKeyedReport";
import { searchUsers } from "@/utils/users";
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

async function searchUserOptions(query: string): Promise<SearchOption[]> {
  const data = await searchUsers({ q: query, pageSize: 8, active: true });
  return data.results.map((user) => ({
    id: user.id,
    label: user.name,
    sublabel: user.email,
  }));
}

export function UserReportView() {
  const [range, setRange] = useState<DateRange>(defaultDateRange);
  const [selected, setSelected] = useState<SearchOption | null>(null);
  const { from, to } = range;
  const userId = selected?.id ?? null;
  const key = userId !== null && from && to ? `${userId}|${from}|${to}` : null;
  const {
    data: report,
    isLoading,
    error,
  } = useKeyedReport(key, () =>
    fetchUserReport(userId as number, { from, to }),
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end gap-4">
        <SearchSelect
          placeholder="Search for a user…"
          search={searchUserOptions}
          selected={selected}
          onSelect={setSelected}
          onClear={() => setSelected(null)}
        />
        <DateRangeControls range={range} onChange={setRange} />
      </div>

      <ReportPanel
        isLoading={isLoading}
        error={error}
        hasData={!!report}
        placeholder={
          <p className="text-text-muted text-sm">
            Pick a user to see their report.
          </p>
        }
      >
        {report ? (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <MetricCard label="Achievements" value={report.total_achievements} />
              <MetricCard
                label="Confirms received"
                value={report.total_confirmations_received}
              />
              <MetricCard
                label="Confirms given"
                value={report.total_confirmations_given}
              />
              <MetricCard
                label="Glazes received"
                value={report.total_glazes_received}
              />
              <MetricCard
                label="Glazes sent"
                value={report.total_glazes_sent}
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
                  data={report.daily_achievements.map((row) => ({
                    day: row.day,
                    value: row.total,
                  }))}
                />
              </ReportSection>
              <ReportSection title="Confirmations received / day">
                <DailyBars
                  data={report.daily_confirmations_received.map((row) => ({
                    day: row.day,
                    value: row.total,
                  }))}
                />
              </ReportSection>
              <ReportSection title="Glazes received / day">
                <DailyBars
                  data={report.daily_glazes_received.map((row) => ({
                    day: row.day,
                    value: row.total,
                  }))}
                />
              </ReportSection>
              <ReportSection title="Glazes sent / day">
                <DailyBars
                  data={report.daily_glazes_sent.map((row) => ({
                    day: row.day,
                    value: row.total,
                  }))}
                />
              </ReportSection>
            </div>

            <div className={gridClass}>
              <ReportSection title="Top achievements">
                <RankingTable
                  rows={report.top_achievements.map((row) => ({
                    key: row.id,
                    label: row.title,
                    sublabel: `${row.reaction_count} reactions`,
                    value: `${row.confirmation_count} ✓`,
                  }))}
                />
              </ReportSection>
              <ReportSection title="Top confirmers">
                <RankingTable
                  rows={report.top_confirmers.map((row) => ({
                    key: row.user_id,
                    label: row.user__name,
                    value: row.confirmation_count,
                  }))}
                />
              </ReportSection>
              <ReportSection title="Top glazers (who glazed them)">
                <RankingTable
                  rows={report.top_glazers.map((row) => ({
                    key: row.posting_user_id,
                    label: row.posting_user__name,
                    value: row.glaze_count,
                  }))}
                />
              </ReportSection>
              <ReportSection title="Most glazed by them">
                <RankingTable
                  rows={report.users_most_glazed_by_user.map((row) => ({
                    key: row.receiving_user_id,
                    label: row.receiving_user__name,
                    value: row.glaze_count,
                  }))}
                />
              </ReportSection>
              <ReportSection title="External teams recognising them">
                <RankingTable
                  rows={report.external_teams_recognising_user.map((row) => ({
                    key: row.posting_user__teammember__team__id,
                    label: row.posting_user__teammember__team__name,
                    value: row.glaze_count,
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
