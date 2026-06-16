type ReportSectionProps = {
  title: string;
  children: React.ReactNode;
};

export function ReportSection({ title, children }: ReportSectionProps) {
  return (
    <section className="glaze-card flex flex-col gap-3">
      <h3 className="text-text text-sm font-black tracking-wide uppercase">
        {title}
      </h3>
      {children}
    </section>
  );
}
