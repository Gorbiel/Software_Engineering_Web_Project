import { Search } from "lucide-react";

type AdminSearchInputProps = {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
};

export function AdminSearchInput({
  id,
  label,
  placeholder,
  value,
  onChange,
}: AdminSearchInputProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-text-muted ml-3 text-xs font-semibold">
        {label}
      </label>
      <div className="bg-background flex items-center gap-2 rounded-2xl px-4 py-2">
        <Search className="text-text-muted h-4 w-4 shrink-0" />
        <input
          id={id}
          className="text-text w-full bg-transparent text-sm focus:outline-none"
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
    </div>
  );
}
