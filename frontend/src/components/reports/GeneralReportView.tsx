"use client";

import { useState } from "react";
import {
  type DateRange,
  type DayActiveUsers,
  type DayTotal,
  defaultDateRange,
  fetchGeneralReport,
} from "@/utils/reports";
import { useKeyedReport } from "@/hooks/useKeyedReport";
import { DateRangeControls } from "@/components/reports/DateRangeControls";
import { ReportPanel } from "@/components/reports/ReportPanel";
import { ReportSection } from "@/components/reports/ReportSection";
import { DailyBars, type DailyValue } from "@/components/reports/DailyBars";
import { RankingTable, type RankingRow } from "@/components/reports/RankingTable";

const gridClass = "grid grid-cols-1 gap-4 md:grid-cols-2";

const toDaily = (rows: DayTotal[]): DailyValue[] =>
  rows.map((row) => ({ day: row.day, value: row.total }));

const activeToDaily = (rows: DayActiveUsers[]): DailyValue[] =>
  rows.map((row) => ({ day: row.day, value: row.active_users }));

function rankRows<T extends { id: number; name: string }>(
  rows: T[],
  value: (row: T) => number | string,
): RankingRow[] {
  return rows.map((row) => ({
    key: row.id,
    label: row.name,
    value: value(row),
  }));
}

const tagRows = (
  rows: { tag_text: string; usage_count: number }[],
): RankingRow[] =>
  rows.map((row) => ({
    key: row.tag_text,
    label: `#${row.tag_text}`,
    value: row.usage_count,
  }));

export function GeneralReportView() {
  const [range, setRange] = useState<DateRange>(defaultDateRange);
  const { from, to } = range;
  const key = from && to ? `${from}|${to}` : null;
  const {
    data: report,
    isLoading,
    error,
  } = useKeyedReport(key, () => fetchGeneralReport({ from, to }));

  return (
    <div className="flex flex-col gap-6">
      <DateRangeControls range={range} onChange={setRange} />
      <ReportPanel isLoading={isLoading} error={error} hasData={!!report}>
        {report ? (
          <div className="flex flex-col gap-6">
            <div className={gridClass}>
              <ReportSection title="Achievements / day">
                <DailyBars data={toDaily(report.daily_achievement_counts)} />
              </ReportSection>
              <ReportSection title="Confirmations / day">
                <DailyBars data={toDaily(report.daily_achievement_confirmations)} />
              </ReportSection>
              <ReportSection title="Reactions / day">
                <DailyBars data={toDaily(report.daily_achievement_reactions)} />
              </ReportSection>
              <ReportSection title="Active users / day">
                <DailyBars data={activeToDaily(report.active_user_daily_count)} />
              </ReportSection>
            </div>

            <div className={gridClass}>
              <ReportSection title="Most glazed users">
                <RankingTable
                  rows={rankRows(
                    report.most_glazed_users,                    (row) => row.received_glaze_count ?? 0,
                  )}
                />
              </ReportSection>
              <ReportSection title="Top glazers">
                <RankingTable
                  rows={rankRows(
                    report.best_glazing_users,                    (row) => row.sent_glaze_count ?? 0,
                  )}
                />
              </ReportSection>
              <ReportSection title="Teams · most achievements">
                <RankingTable
                  rows={rankRows(
                    report.teams_with_most_achivemnents,                    (row) => row.achievements_count,
                  )}
                />
              </ReportSection>
              <ReportSection title="Teams · most glazes received">
                <RankingTable
                  rows={rankRows(
                    report.teams_with_most_recived_glazes,                    (row) => row.glazes_received_count,
                  )}
                />
              </ReportSection>
              <ReportSection title="Teams · most glazes sent">
                <RankingTable
                  rows={rankRows(
                    report.teams_with_most_sent_glazes,                    (row) => row.glazes_sent_count,
                  )}
                />
              </ReportSection>
              <ReportSection title="Teams · most confirmations">
                <RankingTable
                  rows={rankRows(
                    report.teams_with_most_confirmations,                    (row) => row.confirmations_count,
                  )}
                />
              </ReportSection>
              <ReportSection title="Most active teams">
                <RankingTable
                  rows={rankRows(
                    report.most_active_teams,                    (row) => `${Math.round(row.participation_rate ?? 0)}%`,
                  )}
                />
              </ReportSection>
              <ReportSection title="Most cross-team teams">
                <RankingTable
                  rows={rankRows(
                    report.teams_with_most_cross_team_engagment,                    (row) => row.cross_team_sum,
                  )}
                />
              </ReportSection>
              <ReportSection title="Likely siloed teams">
                <RankingTable
                  rows={rankRows(
                    report.probable_siloed_teams,                    (row) => row.cross_team_sum,
                  )}
                />
              </ReportSection>
            </div>

            <div className={gridClass}>
              <ReportSection title="Top achievement tags">
                <RankingTable rows={tagRows(report.top_achievement_tags)} />
              </ReportSection>
              <ReportSection title="Top glaze tags">
                <RankingTable rows={tagRows(report.top_glaze_tags)} />
              </ReportSection>
            </div>
          </div>
        ) : null}
      </ReportPanel>
    </div>
  );
}
