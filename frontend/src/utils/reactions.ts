import { apiFetch, apiJson, ApiError } from "@/utils/api";

export type ReactionUser = {
  id: number | string;
  name: string;
  email: string;
  profile_picture: string | null;
};

export type ReactionType = {
  id: number;
  name: string;
  code: string;
  emoji: string | null;
  creation_date: string;
};

export type ReactionEntry = {
  id: number;
  user: ReactionUser;
  reaction: ReactionType;
  creation_date: string;
};

export type ReactionTarget = "glazes" | "achievements";

export type ReactionOption = {
  code: string;
  emoji: string;
  label: string;
};

export const REACTION_OPTIONS: ReactionOption[] = [
  { code: "thumbs_up", emoji: "👍", label: "Like" },
  { code: "heart", emoji: "❤️", label: "Love" },
  { code: "clap", emoji: "👏", label: "Celebrate" },
  { code: "fire", emoji: "🔥", label: "Fire" },
  { code: "laugh", emoji: "😂", label: "Funny" },
];

export function addReaction(
  target: ReactionTarget,
  entityId: number,
  code: string,
): Promise<ReactionEntry> {
  return apiJson<ReactionEntry>(`/${target}/${entityId}/reactions/`, {
    method: "POST",
    body: JSON.stringify({ code }),
  });
}

export async function removeReaction(
  target: ReactionTarget,
  entityId: number,
  reactionEntryId: number,
): Promise<void> {
  const response = await apiFetch(
    `/${target}/${entityId}/reactions/${reactionEntryId}/`,
    { method: "DELETE" },
  );
  if (!response.ok) {
    throw new ApiError("Unable to update reaction.", response.status, null);
  }
}
