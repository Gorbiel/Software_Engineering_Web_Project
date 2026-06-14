import { GlazeItem } from "@/components/glazes/GlazeItem";
import type { Glaze } from "@/utils/glazes";

type ProfileGlazesProps = {
  currentUserId: number | string | undefined;
  glazes: Glaze[];
  isLoading: boolean;
  error: string | null;
  onChanged: (glaze: Glaze) => void;
  onDeleted: (id: number) => void;
  title?: string;
};

export function ProfileGlazes({
  currentUserId,
  glazes,
  isLoading,
  error,
  onChanged,
  onDeleted,
  title = "Glazes",
}: ProfileGlazesProps) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-text text-base font-semibold">{title}</h2>

      {isLoading ? (
        <p className="text-text-muted px-1 text-sm">Loading glazes…</p>
      ) : error ? (
        <p className="bg-accent-softer text-accent rounded-2xl px-4 py-3 text-sm font-semibold">
          {error}
        </p>
      ) : glazes.length === 0 ? (
        <p className="text-text-muted px-1 text-sm">No glazes yet.</p>
      ) : (
        glazes.map((glaze) => (
          <GlazeItem
            key={glaze.id}
            glaze={glaze}
            currentUserId={currentUserId}
            onChanged={onChanged}
            onDeleted={onDeleted}
          />
        ))
      )}
    </div>
  );
}
