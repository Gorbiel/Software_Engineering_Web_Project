import { apiJson } from "@/utils/api";
import { type PaginatedResponse } from "@/utils/users";

export type Team = {
  id: number;
  name: string;
  creation_date: string;
};

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
