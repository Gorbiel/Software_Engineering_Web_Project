"use client";

import { useState, useEffect } from "react";
import { RankingRow } from "@/components/leaderboards/RankingRow";
import { RankingPodium } from "@/components/leaderboards/RankingPodium";
import type { RankingEntry } from "@/components/leaderboards/types";
import {
  getUserLeaderboard,
  getTeamLeaderboard,
  getMyPosition,
  getMetricLabel,
  type UserLeaderboardMetric,
  type TeamLeaderboardMetric,
} from "@/utils/leaderboard";

type ViewType = "users" | "teams" | "my-position";

export default function LeaderboardsPage() {
  const [viewType, setViewType] = useState<ViewType>("users");
  const [userMetric, setUserMetric] = useState<UserLeaderboardMetric>("total_score");
  const [teamMetric, setTeamMetric] = useState<TeamLeaderboardMetric>("engagement");
  const [userRankings, setUserRankings] = useState<RankingEntry[]>([]);
  const [teamRankings, setTeamRankings] = useState<RankingEntry[]>([]);
  const [myPosition, setMyPosition] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    if (viewType === "users") {
      fetchUserLeaderboard();
    } else if (viewType === "teams") {
      fetchTeamLeaderboard();
    } else {
      fetchMyPosition();
    }
  }, [viewType, userMetric, teamMetric]);

  const fetchUserLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await getUserLeaderboard(userMetric, undefined, 50);
      
      const rankings: RankingEntry[] = response.results.map((entry) => ({
        rank: entry.rank,
        name: entry.name,
        sprinkles: getMetricValue(entry, userMetric),
        trend: "neutral" as const,
        userId: entry.user_id,
      }));
      
      setUserRankings(rankings);
    } catch (error) {
      console.error("Failed to fetch user leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await getTeamLeaderboard(teamMetric, 20);
      
      const rankings: RankingEntry[] = response.results.map((entry) => ({
        rank: entry.rank,
        name: entry.name,
        sprinkles: getTeamMetricValue(entry, teamMetric),
        trend: "neutral" as const,
        teamId: entry.team_id,
      }));
      
      setTeamRankings(rankings);
    } catch (error) {
      console.error("Failed to fetch team leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyPosition = async () => {
    try {
      setLoading(true);
      const response = await getMyPosition();
      setMyPosition(response);
      setCurrentUserId(response.user_id);
    } catch (error) {
      console.error("Failed to fetch my position:", error);
    } finally {
      setLoading(false);
    }
  };

  const getMetricValue = (entry: any, metric: UserLeaderboardMetric): number => {
    switch (metric) {
      case "total_score":
        return entry.total_score;
      case "achievements":
        return entry.achievement_count;
      case "confirmations":
        return entry.confirmations_received;
      case "glazes_received":
        return entry.glazes_received_count;
      case "glazes_sent":
        return entry.glazes_sent_count;
      default:
        return entry.total_score;
    }
  };

  const getTeamMetricValue = (entry: any, metric: TeamLeaderboardMetric): number => {
    switch (metric) {
      case "engagement":
        return entry.engagement_score;
      case "achievements":
        return entry.achievements_count;
      case "glazes":
        return entry.glazes_sent_count;
      case "participation":
        return Math.round(entry.participation_rate);
      default:
        return entry.engagement_score;
    }
  };

  const currentRankings = viewType === "users" ? userRankings : teamRankings;
  const currentMetric = viewType === "users" ? userMetric : teamMetric;

  return (
    <>
      <div className="glaze-card flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-text text-2xl font-semibold">
            Leaderboards
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setViewType("users")}
              className={`cursor-pointer rounded-full px-4 py-2 text-xs font-semibold transition select-none ${
                viewType === "users"
                  ? "bg-primary text-primary-contrast hover:opacity-90"
                  : "bg-background border-border text-text-muted hover:border-border border"
              }`}
            >
              Users
            </button>
            <button
              type="button"
              onClick={() => setViewType("teams")}
              className={`cursor-pointer rounded-full px-4 py-2 text-xs font-semibold transition select-none ${
                viewType === "teams"
                  ? "bg-primary text-primary-contrast hover:opacity-90"
                  : "bg-background border-border text-text-muted hover:border-border border"
              }`}
            >
              Teams
            </button>
            <button
              type="button"
              onClick={() => setViewType("my-position")}
              className={`cursor-pointer rounded-full px-4 py-2 text-xs font-semibold transition select-none ${
                viewType === "my-position"
                  ? "bg-primary text-primary-contrast hover:opacity-90"
                  : "bg-background border-border text-text-muted hover:border-border border"
              }`}
            >
              My Position
            </button>
          </div>
        </div>

        {viewType !== "my-position" && (
          <div className="flex gap-2 flex-wrap">
            <span className="text-text-muted text-xs font-semibold self-center">
              Metric:
            </span>
            {viewType === "users" ? (
              <>
                {(["total_score", "achievements", "confirmations", "glazes_received", "glazes_sent"] as UserLeaderboardMetric[]).map((metric) => (
                  <button
                    key={metric}
                    type="button"
                    onClick={() => setUserMetric(metric)}
                    className={`cursor-pointer rounded-full px-3 py-1 text-xs font-semibold transition select-none ${
                      userMetric === metric
                        ? "bg-accent text-accent-contrast"
                        : "bg-background border-border text-text-muted hover:border-accent border"
                    }`}
                  >
                    {getMetricLabel(metric)}
                  </button>
                ))}
              </>
            ) : (
              <>
                {(["engagement", "achievements", "glazes", "participation"] as TeamLeaderboardMetric[]).map((metric) => (
                  <button
                    key={metric}
                    type="button"
                    onClick={() => setTeamMetric(metric)}
                    className={`cursor-pointer rounded-full px-3 py-1 text-xs font-semibold transition select-none ${
                      teamMetric === metric
                        ? "bg-accent text-accent-contrast"
                        : "bg-background border-border text-text-muted hover:border-accent border"
                    }`}
                  >
                    {getMetricLabel(metric)}
                  </button>
                ))}
              </>
            )}
          </div>
        )}

        {viewType !== "my-position" && currentRankings.length > 0 && (
          <RankingPodium top3={currentRankings.slice(0, 3)} />
        )}
      </div>

      {viewType === "my-position" && myPosition ? (
        <div className="glaze-card flex flex-col gap-4">
          <div className="text-text text-xl font-semibold">Your Rankings</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-background rounded-2xl p-4">
              <div className="text-text-muted text-xs font-semibold mb-2">Total Score</div>
              <div className="text-text text-3xl font-bold">#{myPosition.positions.total_score.rank}</div>
              <div className="text-accent text-sm font-semibold mt-1">
                {myPosition.positions.total_score.score} points
              </div>
            </div>
            <div className="bg-background rounded-2xl p-4">
              <div className="text-text-muted text-xs font-semibold mb-2">Achievements</div>
              <div className="text-text text-3xl font-bold">#{myPosition.positions.achievements.rank}</div>
              <div className="text-accent text-sm font-semibold mt-1">
                {myPosition.positions.achievements.count} achievements
              </div>
            </div>
            <div className="bg-background rounded-2xl p-4">
              <div className="text-text-muted text-xs font-semibold mb-2">Glazes Received</div>
              <div className="text-text text-3xl font-bold">#{myPosition.positions.glazes_received.rank}</div>
              <div className="text-accent text-sm font-semibold mt-1">
                {myPosition.positions.glazes_received.count} glazes
              </div>
            </div>
          </div>
          <div className="text-text text-lg font-semibold mt-4">Your Stats</div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="bg-background rounded-xl p-3">
              <div className="text-text-muted text-xs">Achievements</div>
              <div className="text-text text-xl font-bold">{myPosition.metrics.achievement_count}</div>
            </div>
            <div className="bg-background rounded-xl p-3">
              <div className="text-text-muted text-xs">Confirmations</div>
              <div className="text-text text-xl font-bold">{myPosition.metrics.confirmations_received}</div>
            </div>
            <div className="bg-background rounded-xl p-3">
              <div className="text-text-muted text-xs">Glazes Received</div>
              <div className="text-text text-xl font-bold">{myPosition.metrics.glazes_received_count}</div>
            </div>
            <div className="bg-background rounded-xl p-3">
              <div className="text-text-muted text-xs">Glazes Sent</div>
              <div className="text-text text-xl font-bold">{myPosition.metrics.glazes_sent_count}</div>
            </div>
            <div className="bg-background rounded-xl p-3">
              <div className="text-text-muted text-xs">Weighted Confirmations</div>
              <div className="text-text text-xl font-bold">{myPosition.metrics.weighted_confirmations}</div>
            </div>
            <div className="bg-background rounded-xl p-3">
              <div className="text-text-muted text-xs">Total Score</div>
              <div className="text-text text-xl font-bold">{myPosition.metrics.total_score}</div>
            </div>
          </div>
        </div>
      ) : viewType !== "my-position" && (
        <div className="glaze-card flex flex-col gap-4">
          <div className="text-text-muted flex items-center gap-3 text-xs font-semibold">
            <span className="flex-1">Rank & {viewType === "users" ? "User" : "Team"}</span>
            <span className="w-16 text-center">Trend</span>
            <span className="w-20 text-right">{getMetricLabel(currentMetric)}</span>
          </div>
          {loading ? (
            <div className="text-text-muted text-center py-8">Loading...</div>
          ) : currentRankings.length === 0 ? (
            <div className="text-text-muted text-center py-8">No data available</div>
          ) : (
            <div className="flex flex-col gap-3">
              {currentRankings.slice(3).map((entry) => (
                <RankingRow 
                  key={`${entry.rank}-${entry.name}`} 
                  entry={entry}
                  highlight={viewType === "users" && entry.userId === currentUserId}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}

// Made with Bob
