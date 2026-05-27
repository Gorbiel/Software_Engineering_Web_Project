export function ProfilePhotoSection() {
  return (
    <section className="glaze-card flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-background h-20 w-20 rounded-full" />
          <div className="flex flex-col gap-1">
            <p className="text-text text-sm font-semibold">Profile photo</p>
            <p className="text-text-muted text-xs">PNG or JPG up to 2MB.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <label className="bg-primary text-primary-contrast hover:bg-primary-strong cursor-pointer rounded-full px-4 py-2 text-xs font-semibold transition select-none">
            Change photo
            <input className="sr-only" type="file" />
          </label>
          <button
            type="button"
            className="bg-background border-border text-text-muted hover:bg-primary hover:text-primary-contrast cursor-pointer rounded-full border px-4 py-2 text-xs font-semibold transition select-none"
          >
            Remove
          </button>
        </div>
      </div>
    </section>
  );
}
