import { apiFetch, apiJson, ApiError } from "@/utils/api";
import { type ReactionEntry } from "@/utils/reactions";
import { type TagListItem } from "@/utils/tags";

export type AchievementUser = {
  id: number | string;
  name: string;
  email: string;
  profile_picture: string | null;
};

export type AchievementConfirmation = {
  id: number;
  user: AchievementUser;
  creation_date: string;
};

export type Achievement = {
  id: number;
  user: AchievementUser;
  title: string;
  body: string;
  creation_date: string;
  confirmation_count: number;
  confirmations: AchievementConfirmation[];
  reactions: ReactionEntry[];
  tags: TagListItem[];
};

export type FetchAchievementsParams = {
  userId?: number | string;
  confirmed?: boolean;
};

export type CreateAchievementInput = {
  title: string;
  body: string;
  tag_ids?: number[];
};

function buildQuery(params: FetchAchievementsParams): string {
  const query = new URLSearchParams();
  if (params.userId !== undefined) {
    query.set("user_id", String(params.userId));
  }
  if (params.confirmed !== undefined) {
    query.set("confirmed", params.confirmed ? "true" : "false");
  }
  const qs = query.toString();
  return qs ? `?${qs}` : "";
}

export function fetchAchievements(
  params: FetchAchievementsParams = {},
): Promise<Achievement[]> {
  return apiJson<Achievement[]>(`/achievements/${buildQuery(params)}`);
}

export function createAchievement(
  input: CreateAchievementInput,
): Promise<Achievement> {
  return apiJson<Achievement>("/achievements/", {
    method: "POST",
    body: JSON.stringify({
      title: input.title,
      body: input.body,
      tag_ids: input.tag_ids || [],
    }),
  });
}

export type UpdateAchievementInput = {
  title: string;
  body: string;
  tag_ids?: number[];
};

export function updateAchievement(
  id: number,
  input: UpdateAchievementInput,
): Promise<Achievement> {
  return apiJson<Achievement>(`/achievements/${id}/`, {
    method: "PATCH",
    body: JSON.stringify({
      title: input.title,
      body: input.body,
      tag_ids: input.tag_ids,
    }),
  });
}

export async function deleteAchievement(id: number): Promise<void> {
  const response = await apiFetch(`/achievements/${id}/`, { method: "DELETE" });
  if (!response.ok) {
    throw new ApiError("Unable to delete achievement.", response.status, null);
  }
}

export function confirmAchievement(
  id: number,
): Promise<AchievementConfirmation> {
  return apiJson<AchievementConfirmation>(
    `/achievements/${id}/confirmations/`,
    {
      method: "POST",
    },
  );
}

export type ConfirmationRequest = {
  id: number;
  receiving_user: AchievementUser;
  creation_date: string;
};

export function requestAchievementConfirmation(
  id: number,
  receivingUserId: number | string,
): Promise<ConfirmationRequest> {
  return apiJson<ConfirmationRequest>(
    `/achievements/${id}/confirmations_request/`,
    {
      method: "POST",
      body: JSON.stringify({ receiving_user_id: receivingUserId }),
    },
  );
}

export type IncomingConfirmationRequest = {
  id: number;
  achievement_id: number;
  achievement_title: string;
  requesting_user: AchievementUser;
  receiving_user: AchievementUser;
  creation_date: string;
};

export function fetchIncomingConfirmationRequests(): Promise<
  IncomingConfirmationRequest[]
> {
  return apiJson<IncomingConfirmationRequest[]>(
    "/achievements/confirmation-requests/",
  );
}

export async function deleteConfirmationRequest(id: number): Promise<void> {
  const response = await apiFetch(
    `/achievements/confirmation-requests/${id}/`,
    { method: "DELETE" },
  );
  if (!response.ok) {
    throw new ApiError("Unable to delete request.", response.status, null);
  }
}

export async function clearConfirmationRequests(): Promise<void> {
  const response = await apiFetch(
    "/achievements/confirmation-requests/clear/",
    {
      method: "DELETE",
    },
  );
  if (!response.ok) {
    throw new ApiError("Unable to clear requests.", response.status, null);
  }
}
