/**
 * Dashboard.jsx - Main Dashboard Page Component
 *
 * Displays an overview of the platform's key metrics and visualisations:
 * - Stat cards showing total submissions, total reviews, total users, and pending reviews
 * - A bar chart of submissions grouped by programming language (recharts BarChart)
 * - A pie chart of submission status distribution (recharts PieChart)
 *
 * Data is fetched from the dashboardService.getDashboard() endpoint which
 * returns aggregated statistics compiled on the backend.
 *
 * Route: /dashboard
 *
 * Dependencies:
 * - recharts: BarChart, PieChart, and related sub-components
 * - dashboardService: API service for fetching dashboard data
 * - LoadingSpinner, ErrorMessage: shared UI components
 */

import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import dashboardService from '../../services/dashboardService';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

/* ---------------------------------------------------------------------------
 * Colour palette for charts.
 * These colours are chosen to work well against the dark theme background
 * defined in App.css and provide sufficient contrast for readability.
 * ------------------------------------------------------------------------- */
const CHART_COLORS = [
  '#6c63ff', /* primary purple */
  '#00cec9', /* accent teal */
  '#00b894', /* success green */
  '#fdcb6e', /* warning yellow */
  '#e17055', /* danger coral */
  '#74b9ff', /* info blue */
  '#a29bfe', /* light purple */
  '#fab1a0', /* light coral */
  '#81ecec', /* light teal */
  '#55efc4', /* light green */
];

/**
 * Dashboard - Renders the main dashboard page with statistics and charts.
 *
 * On mount, fetches aggregated dashboard data from the backend. The response
 * is expected to contain:
 * - totalSubmissions: number
 * - totalReviews: number
 * - totalUsers: number
 * - pendingReviews: number
 * - submissionsByLanguage: array of { language, count }
 * - submissionsByStatus: array of { status, count }
 *
 * @returns {JSX.Element} The dashboard page UI
 */
function Dashboard() {
  /* ------ State ------ */
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ------ Data Fetching ------ */

  /**
   * fetchDashboard - Retrieves dashboard statistics from the backend.
   *
   * Called on component mount and when the user clicks "Try Again"
   * after an error. Manages loading and error states.
   */
  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await dashboardService.getDashboard();
      setDashboardData(response.data);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError(
        err.response?.data?.message || 'Failed to load dashboard data. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  /* Fetch data on initial mount */
  useEffect(() => {
    fetchDashboard();
  }, []);

  /* ------ Render States ------ */

  /* Show spinner while data is loading */
  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  /* Show error message with retry option if fetch failed */
  if (error) {
    return <ErrorMessage message={error} onRetry={fetchDashboard} />;
  }

  /* ------ Prepare Chart Data ------ */

  /*
   * Transform the submissionsByLanguage map from the backend ({ "Java": 2, "Python": 1 })
   * into an array of objects ({ language, count }) that Recharts expects.
   */
  const rawLanguage = dashboardData?.submissionsByLanguage;
  const languageData = rawLanguage && typeof rawLanguage === 'object' && !Array.isArray(rawLanguage)
    ? Object.entries(rawLanguage).map(([language, count]) => ({ language, count }))
    : Array.isArray(rawLanguage) ? rawLanguage : [];

  /*
   * Build the submissionsByStatus array from the individual status count fields
   * returned by the backend (pendingReviews, underReview, completedReviews).
   */
  const statusData = [
    dashboardData?.pendingReviews && { status: 'PENDING REVIEW', count: dashboardData.pendingReviews },
    dashboardData?.underReview && { status: 'UNDER REVIEW', count: dashboardData.underReview },
    dashboardData?.completedReviews && { status: 'REVIEWED', count: dashboardData.completedReviews },
  ].filter(Boolean);

  return (
    <div>
      {/* Page header */}
      <div className="page-header">
        <h1>Dashboard</h1>
      </div>

      {/* ---- Stat Cards Grid ---- */}
      <div className="card-grid">
        {/* Total Submissions card */}
        <div className="stat-card">
          <span className="stat-value">
            {dashboardData?.totalSubmissions ?? 0}
          </span>
          <span className="stat-label">Total Submissions</span>
        </div>

        {/* Total Reviews card */}
        <div className="stat-card">
          <span className="stat-value">
            {dashboardData?.totalReviews ?? 0}
          </span>
          <span className="stat-label">Total Reviews</span>
        </div>

        {/* Total Users card */}
        <div className="stat-card">
          <span className="stat-value">
            {dashboardData?.totalUsers ?? 0}
          </span>
          <span className="stat-label">Total Users</span>
        </div>

        {/* Pending Reviews card */}
        <div className="stat-card">
          <span className="stat-value">
            {dashboardData?.pendingReviews ?? 0}
          </span>
          <span className="stat-label">Pending Reviews</span>
        </div>
      </div>

      {/* ---- Charts Grid ---- */}
      <div className="chart-grid">
        {/* Bar Chart: Submissions by Programming Language */}
        <div className="chart-container">
          <h3>Submissions by Language</h3>
          <div className="chart-wrapper">
            {languageData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={languageData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
                >
                  {/* Grid lines for readability */}
                  <CartesianGrid strokeDasharray="3 3" stroke="#2e2e4a" />

                  {/* X axis: programming language names */}
                  <XAxis
                    dataKey="language"
                    tick={{ fill: '#a0a0b8', fontSize: 12 }}
                    axisLine={{ stroke: '#2e2e4a' }}
                  />

                  {/* Y axis: submission count */}
                  <YAxis
                    tick={{ fill: '#a0a0b8', fontSize: 12 }}
                    axisLine={{ stroke: '#2e2e4a' }}
                    allowDecimals={false}
                  />

                  {/* Tooltip shown on hover */}
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a2e',
                      border: '1px solid #2e2e4a',
                      borderRadius: '8px',
                      color: '#e8e8f0',
                    }}
                  />

                  <Legend wrapperStyle={{ color: '#a0a0b8' }} />

                  {/* Bar representing the count per language */}
                  <Bar
                    dataKey="count"
                    name="Submissions"
                    fill="#6c63ff"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="chart-placeholder">
                No submission data available yet.
              </div>
            )}
          </div>
        </div>

        {/* Pie Chart: Submission Status Distribution */}
        <div className="chart-container">
          <h3>Submission Status Distribution</h3>
          <div className="chart-wrapper">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) =>
                      `${name} (${(percent * 100).toFixed(0)}%)`
                    }
                    outerRadius={100}
                    dataKey="count"
                    nameKey="status"
                  >
                    {/*
                     * Each pie slice gets a unique colour from the palette.
                     * The modulo operator ensures the colours cycle if there
                     * are more statuses than colours.
                     */}
                    {statusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>

                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a2e',
                      border: '1px solid #2e2e4a',
                      borderRadius: '8px',
                      color: '#e8e8f0',
                    }}
                  />

                  <Legend wrapperStyle={{ color: '#a0a0b8' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="chart-placeholder">
                No status data available yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
