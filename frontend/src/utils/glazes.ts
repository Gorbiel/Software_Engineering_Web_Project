import { apiJson } from "@/utils/api";

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
