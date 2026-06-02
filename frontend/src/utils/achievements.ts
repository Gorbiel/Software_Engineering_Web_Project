import { apiJson } from "@/utils/api";

export type AchievementUser = {
  id: number | string;
  name: string;
  email: string;
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
};

export type FetchAchievementsParams = {
  userId?: number | string;
  confirmed?: boolean;
};

export type CreateAchievementInput = {
  title: string;
  body: string;
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
    }),
  });
}
