import { apiJson } from "@/utils/api";

export type DayTotal = { day: string; total: number };
export type DayActiveUsers = { day: string; active_users: number };

export type GeneralReport = {
  daily_achievement_counts: DayTotal[];
  daily_achievement_confirmations: DayTotal[];
  daily_achievement_reactions: DayTotal[];
  active_user_daily_count: DayActiveUsers[];
  most_glazed_users: {
    id: number;
    name: string;
    received_glaze_count: number | null;
  }[];
  best_glazing_users: {
    id: number;
    name: string;
    sent_glaze_count: number | null;
  }[];
  teams_with_most_achivemnents: {
    id: number;
    name: string;
    achievements_count: number;
  }[];
  teams_with_most_recived_glazes: {
    id: number;
    name: string;
    glazes_received_count: number;
  }[];
  teams_with_most_sent_glazes: {
    id: number;
    name: string;
    glazes_sent_count: number;
  }[];
  teams_with_most_confirmations: {
    id: number;
    name: string;
    confirmations_count: number;
  }[];
  most_active_teams: {
    id: number;
    name: string;
    participation_rate: number | null;
  }[];
  teams_with_most_cross_team_engagment: {
    id: number;
    name: string;
    cross_team_sum: number;
  }[];
  probable_siloed_teams: { id: number; name: string; cross_team_sum: number }[];
  top_achievement_tags: { tag_text: string; usage_count: number }[];
  top_glaze_tags: { tag_text: string; usage_count: number }[];
};

export type UserReport = {
  total_achievements: number;
  daily_achievements: DayTotal[];
  top_achievements: {
    id: number;
    title: string;
    confirmation_count: number;
    reaction_count: number;
  }[];
  total_confirmations_received: number;
  total_confirmations_given: number;
  daily_confirmations_received: DayTotal[];
  top_confirmers: {
    user_id: number;
    user__name: string;
    confirmation_count: number;
  }[];
  total_glazes_received: number;
  total_glazes_sent: number;
  daily_glazes_received: DayTotal[];
  daily_glazes_sent: DayTotal[];
  top_glazers: {
    posting_user_id: number;
    posting_user__name: string;
    glaze_count: number;
  }[];
  users_most_glazed_by_user: {
    receiving_user_id: number;
    receiving_user__name: string;
    glaze_count: number;
  }[];
  cross_team_glazes_received: number;
  cross_team_glazes_sent: number;
  external_teams_recognising_user: {
    posting_user__teammember__team__id: number;
    posting_user__teammember__team__name: string;
    glaze_count: number;
  }[];
};

export type TeamReport = {
  daily_achievement_counts: DayTotal[];
  daily_achievement_confirmations: DayTotal[];
  daily_achievement_reactions: DayTotal[];
  active_user_daily_count: DayActiveUsers[];
  achievements_count: number;
  glazes_sent_count: number;
  glazes_received_count: number;
  confirmations_count: number;
  participation_rate: number | null;
  cross_team_glazes_received: number;
  cross_team_glazes_sent: number;
  most_glazed_users: {
    id: number;
    name: string;
    email: string;
    received_glaze_count: number;
  }[];
  best_glazing_users: {
    id: number;
    name: string;
    email: string;
    sent_glaze_count: number;
  }[];
  top_achievement_tags_used_by_team: { tag_text: string; usage_count: number }[];
  top_glaze_tags_used_by_team: { tag_text: string; usage_count: number }[];
  top_glaze_tags_recieved_by_team: { tag_text: string; usage_count: number }[];
};

export type DateRange = { from: string; to: string };

function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function defaultDateRange(): DateRange {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30);
  return { from: toISODate(from), to: toISODate(to) };
}

function dateParams(range: DateRange): string {
  return new URLSearchParams({
    date_from: range.from,
    date_to: range.to,
  }).toString();
}

export function fetchGeneralReport(range: DateRange): Promise<GeneralReport> {
  return apiJson<GeneralReport>(`/reports/general/?${dateParams(range)}`);
}

export function fetchUserReport(
  userId: number | string,
  range: DateRange,
): Promise<UserReport> {
  return apiJson<UserReport>(`/reports/${userId}/user/?${dateParams(range)}`);
}

export function fetchTeamReport(
  teamId: number | string,
  range: DateRange,
): Promise<TeamReport> {
  return apiJson<TeamReport>(
    `/teams/team/${teamId}/report/?${dateParams(range)}`,
  );
}
