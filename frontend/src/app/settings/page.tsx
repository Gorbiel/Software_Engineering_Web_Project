export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-text text-2xl font-semibold">Profile Settings</h1>
        <p className="text-text-muted text-sm">
          Update your personal details and profile photo.
        </p>
      </header>

      <section className="glaze-card flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-surface h-20 w-20 rounded-full" />
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

      <section className="glaze-card flex flex-col gap-6">
        <h2 className="text-text text-sm font-semibold">Profile details</h2>
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex flex-1 flex-col gap-2">
            <label className="text-text-muted text-xs font-semibold">
              Full name
            </label>
            <input
              className="bg-background text-text rounded-2xl px-4 py-2 text-sm focus:outline-none"
              defaultValue="Alex Baker"
              type="text"
            />
          </div>
          <div className="flex flex-1 flex-col gap-2">
            <label className="text-text-muted text-xs font-semibold">
              Job title
            </label>
            <input
              className="bg-background text-text rounded-2xl px-4 py-2 text-sm focus:outline-none"
              defaultValue="Senior Experience Designer"
              type="text"
            />
          </div>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex flex-1 flex-col gap-2">
            <label className="text-text-muted text-xs font-semibold">
              Email
            </label>
            <input
              className="bg-background text-text rounded-2xl px-4 py-2 text-sm focus:outline-none"
              defaultValue="alex.baker@glazedin.io"
              type="email"
            />
          </div>
          <div className="flex flex-1 flex-col gap-2">
            <label className="text-text-muted text-xs font-semibold">
              Team
            </label>
            <input
              className="bg-background text-text rounded-2xl px-4 py-2 text-sm focus:outline-none"
              defaultValue="Engineering"
              type="text"
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-text-muted text-xs font-semibold">Bio</label>
          <textarea
            className="bg-background text-text min-h-28 resize-none rounded-2xl px-3 py-2 text-sm focus:outline-none"
            defaultValue="Focused on building delightful team recognition experiences."
          />
        </div>
      </section>

      <section className="glaze-card flex flex-col gap-4">
        <h2 className="text-text text-sm font-semibold">Preferences</h2>
        <div className="flex flex-col gap-3">
          {[
            "Show achievements on profile",
            "Share shout-outs with my team",
            "Email me weekly highlights",
          ].map((item) => (
            <label
              key={item}
              className="border-border bg-background flex cursor-pointer items-center justify-between rounded-2xl border px-4 py-3 text-sm"
            >
              <span className="text-text select-none">{item}</span>
              <input
                className="accent-primary h-4 w-4"
                defaultChecked
                type="checkbox"
              />
            </label>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="bg-primary text-primary-contrast hover:bg-primary-strong cursor-pointer rounded-full px-5 py-2 text-sm font-semibold transition select-none"
        >
          Save changes
        </button>
        <button
          type="button"
          className="bg-background border-border text-text-muted hover:bg-primary hover:text-primary-contrast cursor-pointer rounded-full border px-5 py-2 text-sm font-semibold transition select-none"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
