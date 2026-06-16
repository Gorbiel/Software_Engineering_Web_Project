export type Trend = "up" | "down" | "neutral";

export type RankingEntry = {
  rank: number;
  name: string;
  sprinkles: number;
  trend: Trend;
  userId?: number;
  teamId?: number;
};
