import { apiJson } from "./api";

export interface Tag {
  id: number;
  tag_text: string;
  is_global: boolean;
  scope: string;
  team?: number;
  team_name?: string;
  created_by?: number;
  created_by_name?: string;
  creation_date: string;
}

export interface TagListItem {
  id: number;
  tag_text: string;
  is_global: boolean;
  scope: string;
}

/**
 * Search tags with optional filters
 */
export async function searchTags(
  query: string,
  teamId?: number,
  includeGlobal: boolean = true
): Promise<TagListItem[]> {
  const params = new URLSearchParams({
    q: query,
    include_global: includeGlobal.toString(),
  });

  if (teamId) {
    params.append("team_id", teamId.toString());
  }

  return apiJson<TagListItem[]>(`/tags/search/?${params.toString()}`);
}

/**
 * Get all global tags
 */
export async function getGlobalTags(): Promise<TagListItem[]> {
  return apiJson<TagListItem[]>("/tags/global_tags/");
}

/**
 * Get tags for a specific team
 */
export async function getTeamTags(teamId: number): Promise<TagListItem[]> {
  return apiJson<TagListItem[]>(`/tags/team_tags/?team_id=${teamId}`);
}

/**
 * Get all tags available for a team (global + team-specific)
 */
export async function getAvailableTagsForTeam(
  teamId: number
): Promise<TagListItem[]> {
  return apiJson<TagListItem[]>(`/tags/available_for_team/?team_id=${teamId}`);
}

/**
 * Get all tags (for current user)
 */
export async function getAllTags(): Promise<TagListItem[]> {
  return apiJson<TagListItem[]>("/tags/");
}

/**
 * Create a new tag
 */
export async function createTag(
  tagText: string,
  teamId?: number
): Promise<Tag> {
  return apiJson<Tag>("/tags/", {
    method: "POST",
    body: JSON.stringify({
      tag_text: tagText,
      team: teamId || null,
    }),
  });
}

/**
 * Delete a tag
 */
export async function deleteTag(tagId: number): Promise<void> {
  await apiJson<null>(`/tags/${tagId}/`, {
    method: "DELETE",
  });
}

/**
 * Get tag badge color based on scope
 */
export function getTagBadgeColor(tag: TagListItem | Tag): string {
  return tag.is_global ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800";
}

/**
 * Format tag scope for display
 */
export function formatTagScope(tag: TagListItem | Tag): string {
  return tag.scope;
}

/**
 * Debounce function for search
 */
export function debounce<Args extends unknown[]>(
  func: (...args: Args) => void,
  wait: number
): (...args: Args) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function executedFunction(...args: Args) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

// Made with Bob
