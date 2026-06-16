import { Pencil } from "lucide-react";
import { DeleteButton } from "@/components/forms/DeleteButton";

type EditDeleteActionsProps = {
  onEdit: () => void;
  onDelete: () => void;
  isPending: boolean;
};

// Owner-only edit (pencil) + delete (trash) buttons shared by the entry cards.
export function EditDeleteActions({
  onEdit,
  onDelete,
  isPending,
}: EditDeleteActionsProps) {
  return (
    <>
      <button
        className="hover:text-accent-2 hover:bg-accent-2-soft flex cursor-pointer items-center gap-1 rounded-full px-2 py-1 transition select-none"
        type="button"
        onClick={onEdit}
      >
        <Pencil className="h-4 w-4" />
      </button>
      <DeleteButton onDelete={onDelete} isPending={isPending} />
    </>
  );
}
