const UNITS: { unit: Intl.RelativeTimeFormatUnit; seconds: number }[] = [
  { unit: "year", seconds: 31536000 },
  { unit: "month", seconds: 2592000 },
  { unit: "week", seconds: 604800 },
  { unit: "day", seconds: 86400 },
  { unit: "hour", seconds: 3600 },
  { unit: "minute", seconds: 60 },
];

const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

export function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const diffSeconds = (date.getTime() - Date.now()) / 1000;
  const absSeconds = Math.abs(diffSeconds);

  if (absSeconds < 45) {
    return "just now";
  }

  for (const { unit, seconds } of UNITS) {
    if (absSeconds >= seconds) {
      return formatter.format(Math.round(diffSeconds / seconds), unit);
    }
  }

  return "just now";
}

export function formatDay(iso: string): string {
  return new Date(iso).toLocaleDateString("en", {
    month: "short",
    day: "numeric",
  });
}
