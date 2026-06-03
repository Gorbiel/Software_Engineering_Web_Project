import { apiJson } from "@/utils/api";

export type UserProfile = {
  id: number | string;
  name: string;
  email: string;
  job_title: string | null;
  bio_text: string | null;
  profile_picture: string | null;
};

export function fetchMyProfile(): Promise<UserProfile> {
  return apiJson<UserProfile>("/auth/me/");
}

export type UpdateProfileInput = {
  name?: string;
  email?: string;
  job_title?: string | null;
  bio_text?: string | null;
};

export function updateMyProfile(
  input: UpdateProfileInput,
): Promise<UserProfile> {
  return apiJson<UserProfile>("/auth/me/", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function updateProfilePicture(file: File): Promise<UserProfile> {
  const form = new FormData();
  form.append("profile_picture", file);
  return apiJson<UserProfile>("/auth/me/", {
    method: "PATCH",
    body: form,
  });
}

export function removeProfilePicture(): Promise<UserProfile> {
  return apiJson<UserProfile>("/auth/me/", {
    method: "PATCH",
    body: JSON.stringify({ profile_picture: null }),
  });
}
