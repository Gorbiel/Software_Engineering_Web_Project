import { TitleBodyFields } from "@/components/forms/TitleBodyFields";

type EntryEditCardProps = {
  title: string;
  body: string;
  onTitleChange: (value: string) => void;
  onBodyChange: (value: string) => void;
  titlePlaceholder: string;
  bodyPlaceholder: string;
  error: string | null;
  isPending: boolean;
  onCancel: () => void;
  onSave: () => void;
};

// Full "edit a title + body entry" card, shared by AchievementItem and
// GlazeItem when in edit mode.
export function EntryEditCard({
  title,
  body,
  onTitleChange,
  onBodyChange,
  titlePlaceholder,
  bodyPlaceholder,
  error,
  isPending,
  onCancel,
  onSave,
}: EntryEditCardProps) {
  return (
    <div className="glaze-card flex flex-col gap-4">
      <TitleBodyFields
        title={title}
        body={body}
        onTitleChange={onTitleChange}
        onBodyChange={onBodyChange}
        titlePlaceholder={titlePlaceholder}
        bodyPlaceholder={bodyPlaceholder}
      />
      {error ? (
        <p className="bg-accent-softer text-accent rounded-2xl px-4 py-2 text-xs font-semibold">
          {error}
        </p>
      ) : null}
      <div className="flex items-center justify-end gap-3">
        <button
          className="text-text-muted hover:text-text hover:bg-background cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition select-none"
          type="button"
          onClick={onCancel}
          disabled={isPending}
        >
          Cancel
        </button>
        <button
          className="bg-primary text-primary-contrast hover:bg-primary-strong cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition select-none disabled:cursor-not-allowed disabled:opacity-60"
          type="button"
          onClick={onSave}
          disabled={isPending || title.trim() === "" || body.trim() === ""}
        >
          {isPending ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}
