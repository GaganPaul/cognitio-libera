/**
 * Progress, Dashboard Analytics, and Leaderboard Service.
 *
 * WHAT IT IS:
 *   Aggregates user metrics, dashboard widgets, weak topics, and global rankings.
 */

import { apiRequest } from '../lib/apiClient';
import { DashboardStats, LeaderboardUser } from '../types';

export const progressService = {
  /**
   * Retrieves aggregated dashboard statistics matching the reference UI kit design.
   *
   * @returns DashboardStats object with accuracy, streak, and recent tests.
   */
  async getDashboardStats(): Promise<DashboardStats> {
    return apiRequest<DashboardStats>('/progress/dashboard/stats');
  },

  /**
   * Retrieves global leaderboard rankings.
   *
   * @param limit - Number of top ranked users.
   * @returns List of ranked users.
   */
  async getLeaderboard(limit: number = 10): Promise<LeaderboardUser[]> {
    return apiRequest<LeaderboardUser[]>(`/progress/leaderboard?limit=${limit}`);
  },

  /**
   * Retrieves topic-by-topic mastery breakdown for the progress page.
   *
   * @returns List of topic mastery records.
   */
  async getMasteryBreakdown(): Promise<unknown[]> {
    return apiRequest<unknown[]>('/progress/mastery');
  }
};
