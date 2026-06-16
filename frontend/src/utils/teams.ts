import { apiJson } from "@/utils/api";
import { type PaginatedResponse } from "@/utils/users";

export type Team = {
  id: number;
  name: string;
  creation_date: string;
};

export type TeamMemberUser = {
  id: number;
  name: string;
  email: string;
  job_title: string | null;
  profile_picture: string | null;
  rank: number;
  rank_name: string;
};

export type TeamDetail = {
  id: number;
  name: string;
  creation_date: string;
  members: TeamMemberUser[];
  leaders: TeamMemberUser[];
};

export function fetchMyTeams(): Promise<TeamDetail[]> {
  return apiJson<TeamDetail[]>("/teams/mine/");
}

export function fetchLedTeams(): Promise<Team[]> {
  return apiJson<Team[]>("/teams/team/led/");
}

export async function searchTeams(query: string): Promise<Team[]> {
  const params = new URLSearchParams({ q: query });
  const data = await apiJson<PaginatedResponse<Team>>(
    `/teams/search/?${params.toString()}`,
  );
  return data.results;
}
