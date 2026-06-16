"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  compareTeams,
  getDefaultDateRange,
  type TeamComparisonData,
} from "@/utils/teamComparison";

export default function TeamComparePage() {
  const searchParams = useSearchParams();
  const queryTeamIds = searchParams.get("team_ids") ?? "";
  const [teams, setTeams] = useState<TeamComparisonData[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState(getDefaultDateRange());
  const [teamIds, setTeamIds] = useState<string>(queryTeamIds);

  const fetchComparison = useCallback(async (ids: string, showLoading = true) => {
    const teamIdArray = ids
      .split(",")
      .map((id) => parseInt(id.trim()))
      .filter((id) => !isNaN(id));
    
    if (teamIdArray.length < 2 || teamIdArray.length > 5) {
      alert("Please select 2-5 teams to compare");
      return;
    }

    try {
      await Promise.resolve();
      if (showLoading) {
        setLoading(true);
      }
      const response = await compareTeams(
        teamIdArray,
        dateRange.from,
        dateRange.to
      );
      setTeams(response.teams);
    } catch (error) {
      console.error("Failed to fetch team comparison:", error);
      alert("Failed to load team comparison");
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, [dateRange.from, dateRange.to]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (queryTeamIds) {
        void fetchComparison(queryTeamIds, false);
      }
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [fetchComparison, queryTeamIds]);

  const handleCompare = () => {
    if (teamIds) {
      fetchComparison(teamIds);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="glaze-card flex flex-col gap-4">
        <div className="text-text text-2xl font-semibold">
          Compare Teams
        </div>
        
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-text-muted text-xs font-semibold block mb-2">
              Team IDs (comma-separated, 2-5 teams)
            </label>
            <input
              type="text"
              value={teamIds}
              onChange={(e) => setTeamIds(e.target.value)}
              placeholder="e.g., 1,2,3"
              className="bg-background border-border text-text w-full rounded-xl border px-4 py-2 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-text-muted text-xs font-semibold block mb-2">
                From Date
              </label>
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                className="bg-background border-border text-text w-full rounded-xl border px-4 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-text-muted text-xs font-semibold block mb-2">
                To Date
              </label>
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                className="bg-background border-border text-text w-full rounded-xl border px-4 py-2 text-sm"
              />
            </div>
          </div>

          <button
            onClick={handleCompare}
            disabled={loading}
            className="bg-primary text-primary-contrast hover:opacity-90 rounded-full px-6 py-2 text-sm font-semibold transition disabled:opacity-50"
          >
            {loading ? "Loading..." : "Compare Teams"}
          </button>
        </div>
      </div>

      {teams.length > 0 && (
        <>
          <div className="glaze-card flex flex-col gap-4">
            <div className="text-text text-xl font-semibold">
              Team Overview
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-border border-b">
                    <th className="text-text-muted text-left text-xs font-semibold py-3 px-2">
                      Team
                    </th>
                    <th className="text-text-muted text-center text-xs font-semibold py-3 px-2">
                      Members
                    </th>
                    <th className="text-text-muted text-center text-xs font-semibold py-3 px-2">
                      Achievements
                    </th>
                    <th className="text-text-muted text-center text-xs font-semibold py-3 px-2">
                      Glazes Sent
                    </th>
                    <th className="text-text-muted text-center text-xs font-semibold py-3 px-2">
                      Glazes Received
                    </th>
                    <th className="text-text-muted text-center text-xs font-semibold py-3 px-2">
                      Confirmations
                    </th>
                    <th className="text-text-muted text-center text-xs font-semibold py-3 px-2">
                      Participation %
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map((team) => (
                    <tr key={team.team_id} className="border-border border-b last:border-0">
                      <td className="text-text py-3 px-2 font-semibold">
                        {team.team_name}
                      </td>
                      <td className="text-text text-center py-3 px-2">
                        {team.member_count}
                      </td>
                      <td className="text-text text-center py-3 px-2">
                        {team.metrics.achievements_count}
                      </td>
                      <td className="text-text text-center py-3 px-2">
                        {team.metrics.glazes_sent_count}
                      </td>
                      <td className="text-text text-center py-3 px-2">
                        {team.metrics.glazes_received_count}
                      </td>
                      <td className="text-text text-center py-3 px-2">
                        {team.metrics.confirmations_count}
                      </td>
                      <td className="text-text text-center py-3 px-2">
                        {team.metrics.participation_rate.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="glaze-card flex flex-col gap-4">
            <div className="text-text text-xl font-semibold">
              Cross-Team Engagement
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-border border-b">
                    <th className="text-text-muted text-left text-xs font-semibold py-3 px-2">
                      Team
                    </th>
                    <th className="text-text-muted text-center text-xs font-semibold py-3 px-2">
                      Glazes Sent Outside
                    </th>
                    <th className="text-text-muted text-center text-xs font-semibold py-3 px-2">
                      Glazes Received from Outside
                    </th>
                    <th className="text-text-muted text-center text-xs font-semibold py-3 px-2">
                      Total Cross-Team
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map((team) => (
                    <tr key={team.team_id} className="border-border border-b last:border-0">
                      <td className="text-text py-3 px-2 font-semibold">
                        {team.team_name}
                      </td>
                      <td className="text-text text-center py-3 px-2">
                        {team.metrics.cross_team_glazes_sent}
                      </td>
                      <td className="text-text text-center py-3 px-2">
                        {team.metrics.cross_team_glazes_received}
                      </td>
                      <td className="text-accent text-center py-3 px-2 font-semibold">
                        {team.metrics.cross_team_glazes_sent + team.metrics.cross_team_glazes_received}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map((team) => (
              <div key={team.team_id} className="glaze-card flex flex-col gap-3">
                <div className="text-text text-lg font-semibold">
                  {team.team_name}
                </div>
                
                <div>
                  <div className="text-text-muted text-xs font-semibold mb-2">
                    Top Achievers
                  </div>
                  <div className="flex flex-col gap-2">
                    {team.top_performers.top_achievers.length > 0 ? (
                      team.top_performers.top_achievers.map((performer, idx) => (
                        <div key={performer.id} className="bg-background rounded-xl px-3 py-2 flex justify-between items-center">
                          <span className="text-text text-xs">
                            {idx + 1}. {performer.name}
                          </span>
                          <span className="text-accent text-xs font-semibold">
                            {performer.achievement_count}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-text-muted text-xs text-center py-2">
                        No data
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-text-muted text-xs font-semibold mb-2">
                    Most Glazed
                  </div>
                  <div className="flex flex-col gap-2">
                    {team.top_performers.top_glaze_receivers.length > 0 ? (
                      team.top_performers.top_glaze_receivers.map((performer, idx) => (
                        <div key={performer.id} className="bg-background rounded-xl px-3 py-2 flex justify-between items-center">
                          <span className="text-text text-xs">
                            {idx + 1}. {performer.name}
                          </span>
                          <span className="text-accent text-xs font-semibold">
                            {performer.glaze_count}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-text-muted text-xs text-center py-2">
                        No data
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Made with Bob
