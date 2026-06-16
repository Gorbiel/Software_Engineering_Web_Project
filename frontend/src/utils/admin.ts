import { apiFetch, apiJson, ApiError } from "@/utils/api";

export type AdminUser = {
  id: number | string;
  name: string;
  email: string;
  active: boolean;
  rank: number;
  rank_name: string;
};

export type RankPreset = {
  name: string;
  value: number;
  label: string;
};

export const RANK_PRESETS: RankPreset[] = [
  { name: "default", value: 1, label: "Default" },
  { name: "junior", value: 10, label: "Junior" },
  { name: "mid", value: 50, label: "Mid" },
  { name: "senior", value: 90, label: "Senior" },
  { name: "lead", value: 100, label: "Lead" },
];

export async function checkIsAdmin(): Promise<boolean> {
  const response = await apiFetch("/users/", { method: "GET" });
  return response.ok;
}

type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export async function searchUsers(query: string): Promise<AdminUser[]> {
  const params = new URLSearchParams({ q: query, active: "true" });
  const data = await apiJson<Paginated<AdminUser>>(
    `/users/search/?${params.toString()}`,
  );
  return data.results;
}

export type CreateUserInput = {
  name: string;
  email: string;
  password: string;
};

export function createUser(input: CreateUserInput): Promise<AdminUser> {
  return apiJson<AdminUser>("/users/", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function deleteUser(id: number | string): Promise<void> {
  const response = await apiFetch(`/users/${id}/`, { method: "DELETE" });

  if (!response.ok) {
    throw new ApiError("Couldn't delete the account.", response.status, null);
  }
}

export type RankUpdateResponse = {
  user_id: number;
  rank: number;
  rank_name: string;
};

export function updateUserRank(
  id: number | string,
  rank: number,
): Promise<RankUpdateResponse> {
  return apiJson<RankUpdateResponse>(`/users/${id}/rank/`, {
    method: "PATCH",
    body: JSON.stringify({ rank }),
  });
}
