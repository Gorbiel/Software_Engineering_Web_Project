import { apiJson } from "./api";

export interface UserLeaderboardEntry {
  rank: number;
  user_id: number;
  name: string;
  email: string;
  profile_picture: string | null;
  rank_name: string;
  achievement_count: number;
  confirmations_received: number;
  confirmations_given: number;
  glazes_received_count: number;
  glazes_sent_count: number;
  weighted_confirmations: number;
  total_score: number;
}

export interface TeamLeaderboardEntry {
  rank: number;
  team_id: number;
  name: string;
  member_count: number;
  achievements_count: number;
  glazes_sent_count: number;
  glazes_received_count: number;
  confirmations_count: number;
  participation_rate: number;
  engagement_score: number;
}

export interface UserLeaderboardResponse {
  metric: string;
  team_id: string | null;
  results: UserLeaderboardEntry[];
}

export interface TeamLeaderboardResponse {
  metric: string;
  results: TeamLeaderboardEntry[];
}

export interface MyPositionResponse {
  user_id: number;
  name: string;
  positions: {
    total_score: {
      rank: number;
      score: number;
    };
    achievements: {
      rank: number;
      count: number;
    };
    glazes_received: {
      rank: number;
      count: number;
    };
  };
  metrics: {
    achievement_count: number;
    confirmations_received: number;
    glazes_received_count: number;
    glazes_sent_count: number;
    weighted_confirmations: number;
    total_score: number;
  };
}

export type UserLeaderboardMetric =
  | "total_score"
  | "achievements"
  | "confirmations"
  | "glazes_received"
  | "glazes_sent";

export type TeamLeaderboardMetric =
  | "engagement"
  | "achievements"
  | "glazes"
  | "participation";

export async function getUserLeaderboard(
  metric: UserLeaderboardMetric = "total_score",
  teamId?: number,
  limit: number = 50
): Promise<UserLeaderboardResponse> {
  const params = new URLSearchParams({
    metric,
    limit: limit.toString(),
  });
  
  if (teamId) {
    params.append("team_id", teamId.toString());
  }

  return apiJson<UserLeaderboardResponse>(
    `/users/leaderboard/users/?${params.toString()}`
  );
}

export async function getTeamLeaderboard(
  metric: TeamLeaderboardMetric = "engagement",
  limit: number = 20
): Promise<TeamLeaderboardResponse> {
  const params = new URLSearchParams({
    metric,
    limit: limit.toString(),
  });

  return apiJson<TeamLeaderboardResponse>(
    `/users/leaderboard/teams/?${params.toString()}`
  );
}

export async function getMyPosition(): Promise<MyPositionResponse> {
  return apiJson<MyPositionResponse>("/users/leaderboard/my_position/");
}

export function getMetricLabel(metric: string): string {
  const labels: Record<string, string> = {
    total_score: "Total Score",
    achievements: "Achievements",
    confirmations: "Confirmations",
    glazes_received: "Glazes Received",
    glazes_sent: "Glazes Sent",
    engagement: "Engagement Score",
    glazes: "Glazes",
    participation: "Participation Rate",
  };
  return labels[metric] || metric;
}

export function getRankBadgeColor(rank: number): string {
  if (rank === 1) return "bg-yellow-500 text-white";
  if (rank === 2) return "bg-gray-400 text-white";
  if (rank === 3) return "bg-orange-600 text-white";
  if (rank <= 10) return "bg-blue-500 text-white";
  return "bg-gray-200 text-gray-700";
}

export function getRankEmoji(rank: number): string {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return "";
}

// Made with Bob
