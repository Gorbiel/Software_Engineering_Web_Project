import { Trash2 } from "lucide-react";

type DeleteButtonProps = {
  onDelete: () => void;
  isPending: boolean;
};

export function DeleteButton({ onDelete, isPending }: DeleteButtonProps) {
  return (
    <button
      className="hover:text-accent hover:bg-accent-softer flex cursor-pointer items-center gap-1 rounded-full px-2 py-1 transition select-none disabled:cursor-not-allowed disabled:opacity-60"
      type="button"
      onClick={onDelete}
      disabled={isPending}
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
