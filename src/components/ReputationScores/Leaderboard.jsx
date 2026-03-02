/**
 * Leaderboard.jsx - Reputation Leaderboard Page Component
 *
 * Displays a ranked table of all reviewers sorted by their reputation score.
 * The reputation system incentivises high-quality reviews by tracking and
 * scoring reviewer contributions over time.
 *
 * Table columns:
 * - Rank: position in the leaderboard (1-based, derived from array index)
 * - Username: the reviewer's display name
 * - Total Score: cumulative reputation points earned
 * - Review Count: total number of reviews submitted
 * - Average Accuracy: the average accuracy/quality of their reviews
 *
 * Data is fetched from the reputationScoreService.getLeaderboard() endpoint
 * which returns a pre-sorted list of user reputation records.
 *
 * Route: /leaderboard
 *
 * Dependencies:
 * - reputationScoreService: API service for fetching the leaderboard
 * - LoadingSpinner, ErrorMessage: shared UI feedback components
 */

import React, { useState, useEffect, useCallback } from 'react';
import reputationScoreService from '../../services/reputationScoreService';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

/**
 * getRankStyle - Returns inline style for the top three ranks.
 *
 * The top three positions receive special visual treatment with
 * a coloured left border to highlight their achievement.
 *
 * @param {number} rank - The 1-based rank position
 * @returns {Object} React inline style object
 */
function getRankStyle(rank) {
  switch (rank) {
    case 1:
      /* Gold for first place */
      return { borderLeft: '4px solid #ffd700', fontWeight: 700 };
    case 2:
      /* Silver for second place */
      return { borderLeft: '4px solid #c0c0c0', fontWeight: 600 };
    case 3:
      /* Bronze for third place */
      return { borderLeft: '4px solid #cd7f32', fontWeight: 600 };
    default:
      return {};
  }
}

/**
 * getRankBadgeClass - Returns the badge CSS class for a rank position.
 *
 * Top three ranks get coloured badges; all others get the default style.
 *
 * @param {number} rank - The 1-based rank position
 * @returns {string} CSS class string for the badge
 */
function getRankBadgeClass(rank) {
  switch (rank) {
    case 1:
      return 'badge badge-warning'; /* Gold-ish */
    case 2:
      return 'badge badge-info';    /* Silver-ish */
    case 3:
      return 'badge badge-success'; /* Bronze-ish */
    default:
      return 'badge badge-primary';
  }
}

/**
 * Leaderboard - Renders the reputation leaderboard page.
 *
 * Fetches the sorted leaderboard data on mount and displays it in
 * a table with visual rank indicators for the top three positions.
 *
 * @returns {JSX.Element} The leaderboard page UI
 */
function Leaderboard() {
  /* ------ State ------ */
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ------ Data Fetching ------ */

  /**
   * fetchLeaderboard - Loads the reputation leaderboard from the backend.
   *
   * The backend returns users sorted by totalScore in descending order.
   */
  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await reputationScoreService.getLeaderboard();
      setLeaderboard(response.data || []);
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
      setError(
        err.response?.data?.message || 'Failed to load leaderboard data.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  /* Fetch leaderboard on initial mount */
  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  /* ------ Render ------ */

  if (loading) {
    return <LoadingSpinner message="Loading leaderboard..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchLeaderboard} />;
  }

  return (
    <div>
      {/* Page header */}
      <div className="page-header">
        <h1>Reputation Leaderboard</h1>
      </div>

      {/* Leaderboard table or empty state */}
      {leaderboard.length === 0 ? (
        <div className="empty-state">
          <h3>No reputation data yet</h3>
          <p>
            Reputation scores are calculated based on review quality and
            consistency. Start reviewing code to build your reputation.
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Username</th>
                <th>Total Score</th>
                <th>Review Count</th>
                <th>Average Accuracy</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, index) => {
                /* Rank is 1-based (index + 1) */
                const rank = index + 1;

                return (
                  <tr key={entry.userId || entry.id || index} style={getRankStyle(rank)}>
                    {/* Rank badge with special styling for top 3 */}
                    <td>
                      <span className={getRankBadgeClass(rank)}>
                        #{rank}
                      </span>
                    </td>

                    {/* Username */}
                    <td>
                      <strong>{entry.username || 'Unknown'}</strong>
                    </td>

                    {/* Total reputation score */}
                    <td>
                      <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
                        {entry.totalScore !== undefined
                          ? entry.totalScore.toLocaleString()
                          : '0'}
                      </span>
                    </td>

                    {/* Number of reviews submitted */}
                    <td>{entry.reviewCount ?? 0}</td>

                    {/*
                     * Average accuracy: displayed as a percentage if it
                     * is a decimal (0-1) or as-is if it is already a percentage.
                     */}
                    <td>
                      <span className="badge badge-success">
                        {entry.averageAccuracy !== undefined && entry.averageAccuracy !== null
                          ? entry.averageAccuracy <= 1
                            ? `${(entry.averageAccuracy * 100).toFixed(1)}%`
                            : `${entry.averageAccuracy.toFixed(1)}%`
                          : 'N/A'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Leaderboard;
