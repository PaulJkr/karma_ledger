export const getWeekFromJoinDate = (
  joinedAt: Date,
  weekOffset: number,
): { start: Date; end: Date } => {
  const joined = new Date(joinedAt);
  const start = new Date(joined.getTime() + (weekOffset - 1) * 7 * 86400000);
  const end = new Date(start.getTime() + 6 * 86400000);
  return { start, end };
};
