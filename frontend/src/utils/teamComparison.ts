import { apiJson } from "./api";

export interface TeamComparisonData {
  team_id: number;
  team_name: string;
  member_count: number;
  metrics: {
    achievements_count: number;
    glazes_sent_count: number;
    glazes_received_count: number;
    confirmations_count: number;
    participation_rate: number;
    cross_team_glazes_received: number;
    cross_team_glazes_sent: number;
  };
  top_performers: {
    top_achievers: Array<{
      id: number;
      name: string;
      achievement_count: number;
    }>;
    top_glaze_receivers: Array<{
      id: number;
      name: string;
      glaze_count: number;
    }>;
  };
}

export interface TeamComparisonResponse {
  date_from: string;
  date_to: string;
  teams: TeamComparisonData[];
}

export async function compareTeams(
  teamIds: number[],
  dateFrom?: string,
  dateTo?: string
): Promise<TeamComparisonResponse> {
  const params = new URLSearchParams({
    team_ids: teamIds.join(","),
  });

  if (dateFrom) {
    params.append("date_from", dateFrom);
  }
  if (dateTo) {
    params.append("date_to", dateTo);
  }

  return apiJson<TeamComparisonResponse>(`/teams/compare/?${params.toString()}`);
}

export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function getDefaultDateRange(): { from: string; to: string } {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30);

  return {
    from: formatDate(from),
    to: formatDate(to),
  };
}

// Made with Bob
