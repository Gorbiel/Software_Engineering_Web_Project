import { PageShell } from "@/components/PageShell";

export default function ProfilePage() {
  return (
    <PageShell
      sidebar={
        <>
          <div className="glaze-card flex flex-col gap-4">
            <h2 className="text-text text-sm font-semibold">
              Badges & Rewards
            </h2>
            <div className="flex items-center gap-3">
              <div className="bg-background h-12 w-12 rounded-full" />
              <div className="bg-background h-12 w-12 rounded-full" />
              <div className="bg-background h-12 w-12 rounded-full" />
            </div>
            <div className="bg-background h-3 w-32 rounded-full" />
          </div>
          <div className="glaze-card flex flex-col gap-4">
            <h2 className="text-text text-sm font-semibold">Level Progress</h2>
            <div className="flex items-end justify-between">
              <div className="bg-background h-8 w-20 rounded-full" />
              <div className="bg-background h-5 w-16 rounded-full" />
            </div>
            <div className="bg-accent-softer h-2 w-full rounded-full">
              <div className="bg-accent h-full w-3/5 rounded-full" />
            </div>
            <div className="bg-background h-10 rounded-2xl" />
          </div>
        </>
      }
    >
      <div className="glaze-card flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-background h-20 w-20 rounded-3xl" />
            <div className="flex flex-col gap-2">
              <div className="bg-background h-4 w-40 rounded-full" />
              <div className="bg-background h-3 w-28 rounded-full" />
              <div className="bg-background h-6 w-24 rounded-full" />
            </div>
          </div>
          <button className="bg-primary text-primary-contrast hover:bg-primary-strong cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition select-none">
            Edit Profile
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-4">
        {["Achievements", "Shout-outs", "Sprinkles"].map((label) => (
          <div
            key={label}
            className="glaze-card flex min-w-40 flex-1 flex-col gap-3"
          >
            <div className="bg-background h-4 w-24 rounded-full" />
            <div className="bg-background h-8 w-16 rounded-full" />
            <div className="bg-background h-3 w-20 rounded-full" />
          </div>
        ))}
      </div>
      <div className="glaze-card flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-text text-sm font-semibold">My Achievements</h2>
          <div className="bg-background h-7 w-20 rounded-full" />
        </div>
        <div className="flex flex-col gap-4">
          {["Highlight", "Project"].map((item) => (
            <div
              key={item}
              className="bg-background flex flex-col gap-3 rounded-3xl p-4"
            >
              <div className="bg-surface h-4 w-40 rounded-full" />
              <div className="bg-surface h-20 rounded-2xl" />
              <div className="flex gap-3">
                <div className="bg-surface h-6 w-12 rounded-full" />
                <div className="bg-surface h-6 w-16 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
