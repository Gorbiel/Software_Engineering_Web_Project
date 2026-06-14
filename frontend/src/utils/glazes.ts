import { apiFetch, apiJson, ApiError } from "@/utils/api";

export type GlazeUser = {
  id: number;
  name: string;
  email: string;
  profile_picture: string | null;
};

export type Glaze = {
  id: number;
  posting_user: GlazeUser;
  receiving_user: GlazeUser;
  title: string;
  body: string;
  creation_date: string;
};

export type CreateGlazeInput = {
  receivingUserId: number | string;
  title: string;
  body: string;
};

export function createGlaze(input: CreateGlazeInput): Promise<Glaze> {
  return apiJson<Glaze>("/glazes/", {
    method: "POST",
    body: JSON.stringify({
      receiving_user_id: Number(input.receivingUserId),
      title: input.title,
      body: input.body,
    }),
  });
}

export type FetchGlazesParams = {
  sentBy?: number | string;
  receivedBy?: number | string;
};

function buildQuery(params: FetchGlazesParams): string {
  const query = new URLSearchParams();
  if (params.sentBy !== undefined) {
    query.set("sent_by", String(params.sentBy));
  }
  if (params.receivedBy !== undefined) {
    query.set("received_by", String(params.receivedBy));
  }
  const qs = query.toString();
  return qs ? `?${qs}` : "";
}

export function fetchGlazes(params: FetchGlazesParams = {}): Promise<Glaze[]> {
  return apiJson<Glaze[]>(`/glazes/${buildQuery(params)}`);
}

export type UpdateGlazeInput = {
  title: string;
  body: string;
};

export function updateGlaze(
  id: number,
  input: UpdateGlazeInput,
): Promise<Glaze> {
  return apiJson<Glaze>(`/glazes/${id}/`, {
    method: "PATCH",
    body: JSON.stringify({
      title: input.title,
      body: input.body,
    }),
  });
}

export async function deleteGlaze(id: number): Promise<void> {
  const response = await apiFetch(`/glazes/${id}/`, { method: "DELETE" });
  if (!response.ok) {
    throw new ApiError("Unable to delete glaze.", response.status, null);
  }
}
