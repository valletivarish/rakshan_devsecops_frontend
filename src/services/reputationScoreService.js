/**
 * reputationScoreService.js - Reputation Score API Service
 *
 * Manages reputation-related API interactions. The reputation system
 * incentivises high-quality reviews by tracking and scoring reviewer
 * contributions over time.
 *
 * Available operations:
 * - getLeaderboard: Fetch the ranked list of top contributors
 * - getByUserId:    Fetch reputation details for a specific user
 */

import api from "./api";

/**
 * Base path for reputation endpoints on the Spring Boot backend.
 */
const REPUTATION_BASE = "/reputation";

/**
 * reputationScoreService - Encapsulates all reputation-related API calls.
 */
const reputationScoreService = {
  /**
   * getLeaderboard - Retrieve the platform-wide reputation leaderboard.
   *
   * Returns a ranked list of users sorted by their reputation score
   * in descending order. This is displayed on the Leaderboard page.
   *
   * @returns {Promise<import('axios').AxiosResponse>} Sorted list of user reputation records
   */
  getLeaderboard() {
    return api.get(`${REPUTATION_BASE}/leaderboard`);
  },

  /**
   * getByUserId - Retrieve the reputation score for a specific user.
   *
   * Useful for displaying a user's own score on their profile or
   * dashboard, as well as for looking up other users' scores.
   *
   * @param {number|string} userId - The user ID to look up
   * @returns {Promise<import('axios').AxiosResponse>} Reputation record for the given user
   */
  getByUserId(userId) {
    return api.get(`${REPUTATION_BASE}/user/${userId}`);
  },
};

export default reputationScoreService;
