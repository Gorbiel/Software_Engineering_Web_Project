type TitleBodyFieldsProps = {
  title: string;
  body: string;
  onTitleChange: (value: string) => void;
  onBodyChange: (value: string) => void;
  titlePlaceholder: string;
  bodyPlaceholder: string;
  autoFocus?: boolean;
};

// The title input + body textarea pair shared by every create/edit form
// (achievement input, glaze modal, achievement edit, glaze edit).
export function TitleBodyFields({
  title,
  body,
  onTitleChange,
  onBodyChange,
  titlePlaceholder,
  bodyPlaceholder,
  autoFocus,
}: TitleBodyFieldsProps) {
  return (
    <>
      <input
        className="bg-background placeholder:text-text-muted text-text rounded-2xl px-4 py-3 text-sm font-semibold focus:outline-none"
        placeholder={titlePlaceholder}
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        autoFocus={autoFocus}
      />
      <div className="bg-background h-28 rounded-2xl px-4 py-3">
        <textarea
          className="placeholder:text-text-muted h-full w-full resize-none bg-transparent text-sm focus:outline-none"
          placeholder={bodyPlaceholder}
          value={body}
          onChange={(e) => onBodyChange(e.target.value)}
        />
      </div>
    </>
  );
}
