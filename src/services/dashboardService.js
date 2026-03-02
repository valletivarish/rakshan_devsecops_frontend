/**
 * dashboardService.js - Dashboard API Service
 *
 * Provides a single endpoint to fetch aggregated dashboard data
 * for the authenticated user. The backend compiles statistics such as
 * total submissions, total reviews, average scores, recent activity,
 * and other summary metrics into a single response.
 *
 * This reduces the number of network requests required to render the
 * dashboard page compared to fetching each metric individually.
 */

import api from "./api";

/**
 * Base path for the dashboard endpoint on the Spring Boot backend.
 */
const DASHBOARD_BASE = "/dashboard";

/**
 * dashboardService - Encapsulates the dashboard API call.
 */
const dashboardService = {
  /**
   * getDashboard - Retrieve aggregated dashboard statistics.
   *
   * The response typically includes:
   * - Total number of code submissions
   * - Total number of reviews given and received
   * - Average quality scores
   * - Recent activity feed
   * - Status distribution breakdown
   *
   * @returns {Promise<import('axios').AxiosResponse>} Dashboard summary object
   */
  getDashboard() {
    return api.get(DASHBOARD_BASE);
  },
};

export default dashboardService;
