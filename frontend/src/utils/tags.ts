import { getBackendURL } from "./proxy";

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

  const response = await fetch(
    `${getBackendURL()}/api/tags/search/?${params.toString()}`,
    {
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to search tags");
  }

  return response.json();
}

/**
 * Get all global tags
 */
export async function getGlobalTags(): Promise<TagListItem[]> {
  const response = await fetch(`${getBackendURL()}/api/tags/global_tags/`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch global tags");
  }

  return response.json();
}

/**
 * Get tags for a specific team
 */
export async function getTeamTags(teamId: number): Promise<TagListItem[]> {
  const response = await fetch(
    `${getBackendURL()}/api/tags/team_tags/?team_id=${teamId}`,
    {
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch team tags");
  }

  return response.json();
}

/**
 * Get all tags available for a team (global + team-specific)
 */
export async function getAvailableTagsForTeam(
  teamId: number
): Promise<TagListItem[]> {
  const response = await fetch(
    `${getBackendURL()}/api/tags/available_for_team/?team_id=${teamId}`,
    {
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch available tags");
  }

  return response.json();
}

/**
 * Get all tags (for current user)
 */
export async function getAllTags(): Promise<TagListItem[]> {
  const response = await fetch(`${getBackendURL()}/api/tags/`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch tags");
  }

  return response.json();
}

/**
 * Create a new tag
 */
export async function createTag(
  tagText: string,
  teamId?: number
): Promise<Tag> {
  const response = await fetch(`${getBackendURL()}/api/tags/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      tag_text: tagText,
      team: teamId || null,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to create tag");
  }

  return response.json();
}

/**
 * Delete a tag
 */
export async function deleteTag(tagId: number): Promise<void> {
  const response = await fetch(`${getBackendURL()}/api/tags/${tagId}/`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to delete tag");
  }
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
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
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
