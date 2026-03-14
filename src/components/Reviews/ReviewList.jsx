/**
 * ReviewList.jsx - Review List Page Component
 *
 * Displays a table of all peer code reviews in the platform. Each row shows:
 * - The title of the code submission that was reviewed
 * - The reviewer's username
 * - The average score across all rating dimensions
 * - The review status/quality score
 * - The date the review was created
 *
 * Provides a "New Review" button that navigates to the review creation form.
 *
 * Route: /reviews
 *
 * Dependencies:
 * - reviewService: API service for fetching all reviews
 * - react-router-dom: navigation to review form and submission detail
 * - LoadingSpinner, ErrorMessage: shared UI feedback components
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import reviewService from '../../services/reviewService';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

/**
 * calculateAverageScore - Computes the average rating score from a review's
 * dimension ratings array.
 *
 * If the review does not have dimension ratings, falls back to the
 * qualityScore field. Returns 'N/A' if no score data is available.
 *
 * @param {Object} review - The review object
 * @returns {string} The formatted average score or 'N/A'
 */
function calculateAverageScore(review) {
  /* Check if the review has detailed dimension ratings */
  if (review.ratings && review.ratings.length > 0) {
    const total = review.ratings.reduce((sum, r) => sum + (r.score || 0), 0);
    const avg = total / review.ratings.length;
    return avg.toFixed(1);
  }

  /* Fall back to the overall quality score */
  if (review.qualityScore !== undefined && review.qualityScore !== null) {
    return review.qualityScore.toFixed(1);
  }

  return 'N/A';
}

/**
 * ReviewList - Renders a table of all reviews with metadata.
 *
 * Fetches the complete list of reviews on mount. Each row provides
 * the submission title (linked to its detail page), reviewer name,
 * average score, and creation date.
 *
 * @returns {JSX.Element} The review list page UI
 */
function ReviewList() {
  /* ------ State ------ */
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ------ Data Fetching ------ */

  /**
   * fetchReviews - Loads all reviews from the backend API.
   *
   * Called on mount and when the user retries after an error.
   */
  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await reviewService.getAll();
      setReviews(response.data || []);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
      setError(
        err.response?.data?.message || 'Failed to load reviews. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  /* Fetch reviews on initial mount */
  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  /* ------ Render ------ */

  if (loading) {
    return <LoadingSpinner message="Loading reviews..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchReviews} />;
  }

  return (
    <div>
      {/* Page header with title and "New Review" action button */}
      <div className="page-header">
        <h1>Reviews</h1>
        <Link to="/reviews/new" className="btn btn-primary">
          + New Review
        </Link>
      </div>

      {/* Reviews table or empty state */}
      {reviews.length === 0 ? (
        <div className="empty-state">
          <h3>No reviews yet</h3>
          <p>No peer reviews have been submitted. Be the first to review code.</p>
          <Link to="/reviews/new" className="btn btn-primary">
            Write a Review
          </Link>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Submission</th>
                <th>Reviewer</th>
                <th>Avg Score</th>
                <th>Quality Score</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review) => (
                <tr key={review.id}>
                  {/* Submission title with link to its detail page */}
                  <td>
                    {(review.codeSubmissionId || review.submissionId) ? (
                      <Link
                        to={`/submissions/${review.codeSubmissionId || review.submissionId}`}
                        style={{ color: 'var(--color-primary)' }}
                      >
                        {review.codeSubmissionTitle || review.submissionTitle || `Submission #${review.codeSubmissionId || review.submissionId}`}
                      </Link>
                    ) : (
                      review.codeSubmissionTitle || review.submissionTitle || 'Unknown Submission'
                    )}
                  </td>

                  {/* Reviewer username */}
                  <td>{review.reviewerUsername || review.username || 'Anonymous'}</td>

                  {/* Calculated average score across all dimensions */}
                  <td>
                    <span className="badge badge-info">
                      {calculateAverageScore(review)}
                    </span>
                  </td>

                  {/* Overall quality score */}
                  <td>
                    {(review.averageScore !== undefined && review.averageScore !== null) || (review.qualityScore !== undefined && review.qualityScore !== null) ? (
                      <span className="badge badge-success">
                        {(review.averageScore || review.qualityScore || 0).toFixed(1)}
                      </span>
                    ) : (
                      <span className="badge badge-primary">-</span>
                    )}
                  </td>

                  {/* Creation date */}
                  <td>
                    {review.createdAt
                      ? new Date(review.createdAt).toLocaleDateString()
                      : '-'}
                  </td>

                  {/* View action: navigates to the submission detail */}
                  <td>
                    <Link
                      to={`/submissions/${review.codeSubmissionId || review.submissionId}`}
                      className="btn btn-secondary btn-sm"
                    >
                      View Submission
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ReviewList;
