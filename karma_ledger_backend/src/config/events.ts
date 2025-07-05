export enum BadgeCode {
  FIRST_ACTION = 'first_action',
  FIRST_SUGGESTION = 'first_suggestion',
  KARMA_5 = 'karma_5',
  WEEKLY_CHECKIN_3 = 'weekly_checkin_3',
  TOP10 = 'top10_leaderboard',
}

export enum BadgeEvents {
  FIRST_ACTION = 'karma.first_action',
  FIRST_SUGGESTION = 'suggestion.received',
  KARMA_5 = 'karma.count_reached_5',
  WEEKLY_CHECKIN_3 = 'karma.weekly_checkin_3',
  TOP10_RANKED = 'leaderboard.top10',
}
