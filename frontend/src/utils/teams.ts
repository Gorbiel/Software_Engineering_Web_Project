import { apiFetch, apiJson, ApiError } from "@/utils/api";
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

export function fetchLedTeams(): Promise<TeamDetail[]> {
  return apiJson<TeamDetail[]>("/teams/team/led/");
}

export async function searchTeams(query: string): Promise<TeamDetail[]> {
  const params = new URLSearchParams({ q: query });
  const data = await apiJson<PaginatedResponse<TeamDetail>>(
    `/teams/search/?${params.toString()}`,
  );
  return data.results;
}

export function createTeam(name: string): Promise<TeamDetail> {
  return apiJson<TeamDetail>("/teams/", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export function fetchTeam(id: number | string): Promise<TeamDetail> {
  return apiJson<TeamDetail>(`/teams/${id}/`);
}

export function addTeamMember(
  teamId: number | string,
  userId: number | string,
): Promise<TeamDetail> {
  return apiJson<TeamDetail>(`/teams/${teamId}/members/`, {
    method: "POST",
    body: JSON.stringify({ user_id: userId }),
  });
}

export async function removeTeamMember(
  teamId: number | string,
  userId: number | string,
): Promise<void> {
  const response = await apiFetch(`/teams/${teamId}/members/${userId}/`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new ApiError("Couldn't remove the member.", response.status, null);
  }
}

export function addTeamLeader(
  teamId: number | string,
  userId: number | string,
): Promise<TeamDetail> {
  return apiJson<TeamDetail>(`/teams/${teamId}/leaders/`, {
    method: "POST",
    body: JSON.stringify({ user_id: userId }),
  });
}

export async function removeTeamLeader(
  teamId: number | string,
  userId: number | string,
): Promise<void> {
  const response = await apiFetch(`/teams/${teamId}/leaders/${userId}/`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new ApiError("Couldn't remove the leader.", response.status, null);
  }
}
