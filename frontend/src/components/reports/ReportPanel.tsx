type ReportPanelProps = {
  isLoading: boolean;
  error: string | null;
  hasData: boolean;
  placeholder?: React.ReactNode;
  children: React.ReactNode;
};

export function ReportPanel({
  isLoading,
  error,
  hasData,
  placeholder,
  children,
}: ReportPanelProps) {
  if (error) {
    return (
      <p className="bg-accent-softer text-accent rounded-2xl px-4 py-2 text-sm font-semibold">
        {error}
      </p>
    );
  }

  if (isLoading) {
    return <p className="text-text-muted text-sm">Loading report…</p>;
  }

  if (!hasData) {
    return placeholder ? <>{placeholder}</> : null;
  }

  return <>{children}</>;
}
