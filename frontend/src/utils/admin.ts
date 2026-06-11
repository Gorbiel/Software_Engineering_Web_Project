import { apiFetch, apiJson, ApiError } from "@/utils/api";

export type AdminUser = {
  id: number | string;
  name: string;
  email: string;
  active: boolean;
};

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
