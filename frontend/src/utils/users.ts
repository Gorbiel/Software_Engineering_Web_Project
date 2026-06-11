import { apiJson } from "@/utils/api";

export type UserSearchResult = {
  id: number;
  name: string;
  email: string;
  job_title: string | null;
  bio_text: string | null;
  profile_picture: string | null;
  creation_date: string;
  active: boolean;
};

export type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type SearchUsersParams = {
  q: string;
  page?: number;
  pageSize?: number;
  sortBy?: "name" | "creation_date" | "email";
  order?: "asc" | "desc";
  active?: boolean;
};

function buildQuery(params: SearchUsersParams): string {
  const query = new URLSearchParams();
  query.set("q", params.q);
  if (params.page !== undefined) {
    query.set("page", String(params.page));
  }
  if (params.pageSize !== undefined) {
    query.set("page_size", String(params.pageSize));
  }
  if (params.sortBy !== undefined) {
    query.set("sort_by", params.sortBy);
  }
  if (params.order !== undefined) {
    query.set("order", params.order);
  }
  if (params.active !== undefined) {
    query.set("active", params.active ? "true" : "false");
  }
  return query.toString();
}

export function searchUsers(
  params: SearchUsersParams,
): Promise<PaginatedResponse<UserSearchResult>> {
  return apiJson<PaginatedResponse<UserSearchResult>>(
    `/users/search/?${buildQuery(params)}`,
  );
}
