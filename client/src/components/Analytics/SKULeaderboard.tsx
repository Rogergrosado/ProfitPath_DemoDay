import { SKULeaderboardTable } from "./SKULeaderboardTable";

interface SKULeaderboardProps {
  dateRange?: string;
}

export function SKULeaderboard({ dateRange = '30d' }: SKULeaderboardProps) {
  return <SKULeaderboardTable dateRange={dateRange} />;
}