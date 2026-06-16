import { searchUsers } from "@/utils/users";
import { type SearchOption } from "@/components/reports/SearchSelect";

export async function searchUserOptions(query: string): Promise<SearchOption[]> {
  const data = await searchUsers({ q: query, pageSize: 8, active: true });
  return data.results.map((user) => ({
    id: user.id,
    label: user.name,
    sublabel: user.email,
  }));
}
