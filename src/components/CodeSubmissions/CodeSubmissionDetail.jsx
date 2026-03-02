/**
 * CodeSubmissionDetail.jsx - Code Submission Detail Page Component
 *
 * Displays the full details of a single code submission, including:
 * - Title, description, and metadata (author, date, language, status)
 * - The source code rendered in a pre/code block with monospace font
 * - A status badge with colour coding
 * - An "Assign Reviewer" button (for submissions in PENDING_REVIEW status)
 * - A list of all reviews submitted for this code
 * - A link to write a new review
 *
 * Route: /submissions/:id
 *
 * Dependencies:
 * - codeSubmissionService: fetch submission by ID, assign reviewer
 * - reviewService: fetch reviews for this submission
 * - react-router-dom: route parameter extraction and navigation
 * - react-toastify: success/error notifications
 * - AuthContext: current user info for the assign reviewer feature
 * - LoadingSpinner, ErrorMessage: shared UI feedback components
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import codeSubmissionService from '../../services/codeSubmissionService';
import reviewService from '../../services/reviewService';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

/**
 * getStatusBadgeClass - Returns the appropriate badge CSS class for a status.
 *
 * @param {string} status - The submission's review status
 * @returns {string} CSS class string for the status badge
 */
function getStatusBadgeClass(status) {
  switch (status) {
    case 'PENDING_REVIEW':
      return 'badge badge-warning';
    case 'UNDER_REVIEW':
      return 'badge badge-info';
    case 'REVIEWED':
      return 'badge badge-success';
    default:
      return 'badge badge-primary';
  }
}

/**
 * CodeSubmissionDetail - Renders the full detail view of a code submission.
 *
 * Fetches both the submission data and its associated reviews on mount.
 * Provides actions for assigning a reviewer and navigating to the review form.
 *
 * @returns {JSX.Element} The submission detail page UI
 */
function CodeSubmissionDetail() {
  /* Extract the submission ID from the URL */
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  /* ------ State ------ */
  const [submission, setSubmission] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assigning, setAssigning] = useState(false);

  /* ------ Data Fetching ------ */

  /**
   * fetchData - Loads the submission detail and its reviews in parallel.
   *
   * Both API calls are made simultaneously using Promise.all for
   * better performance. If either fails, an error is displayed.
   */
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [submissionRes, reviewsRes] = await Promise.all([
        codeSubmissionService.getById(id),
        reviewService.getBySubmission(id),
      ]);

      setSubmission(submissionRes.data);
      setReviews(reviewsRes.data || []);
    } catch (err) {
      console.error('Failed to fetch submission detail:', err);
      setError(
        err.response?.data?.message || 'Failed to load submission details.'
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  /* Fetch data on mount and whenever the ID changes */
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ------ Assign Reviewer ------ */

  /**
   * handleAssignReviewer - Assigns the current user as a reviewer.
   *
   * Sends a POST request to the backend's assign-reviewer endpoint
   * with the current user's ID. On success, the submission is refetched
   * to reflect the updated status.
   */
  const handleAssignReviewer = async () => {
    if (!user?.userId) {
      toast.error('Unable to determine your user ID.');
      return;
    }

    setAssigning(true);
    try {
      await codeSubmissionService.assignReviewer(id, {
        reviewerId: user.userId,
      });
      toast.success('You have been assigned as a reviewer.');
      /* Refetch to get the updated status */
      await fetchData();
    } catch (err) {
      console.error('Failed to assign reviewer:', err);
      toast.error(
        err.response?.data?.message || 'Failed to assign reviewer.'
      );
    } finally {
      setAssigning(false);
    }
  };

  /* ------ Render States ------ */

  if (loading) {
    return <LoadingSpinner message="Loading submission details..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchData} />;
  }

  if (!submission) {
    return <ErrorMessage message="Submission not found." />;
  }

  return (
    <div>
      {/* Page header with back navigation */}
      <div className="page-header">
        <h1>{submission.title}</h1>
        <div className="btn-group">
          <button
            className="btn btn-secondary"
            onClick={() => navigate('/submissions')}
          >
            Back to List
          </button>

          {/*
           * Assign Reviewer button: only shown when the submission is
           * in PENDING_REVIEW status, meaning no reviewer has been assigned yet.
           */}
          {submission.status === 'PENDING_REVIEW' && (
            <button
              className="btn btn-primary"
              onClick={handleAssignReviewer}
              disabled={assigning}
            >
              {assigning ? 'Assigning...' : 'Assign Me as Reviewer'}
            </button>
          )}

          {/* Write Review link: navigates to the review form pre-populated */}
          <Link
            to={`/reviews/new?submissionId=${id}`}
            className="btn btn-success"
          >
            Write Review
          </Link>
        </div>
      </div>

      {/* ---- Submission Metadata Card ---- */}
      <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
        <div className="card-header">
          <h3>Submission Details</h3>
          {/* Status badge */}
          <span className={getStatusBadgeClass(submission.status)}>
            {submission.status?.replace(/_/g, ' ')}
          </span>
        </div>

        <div className="card-body">
          {/* Description section */}
          {submission.description && (
            <div style={{ marginBottom: 'var(--space-md)' }}>
              <strong>Description:</strong>
              <p style={{ marginTop: 'var(--space-xs)' }}>
                {submission.description}
              </p>
            </div>
          )}

          {/* Metadata grid: language, author, date */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 'var(--space-md)',
              marginBottom: 'var(--space-md)',
            }}
          >
            <div>
              <strong>Language:</strong>{' '}
              <span className="badge badge-primary">{submission.language}</span>
            </div>
            <div>
              <strong>Author:</strong>{' '}
              {submission.authorUsername || submission.username || 'Unknown'}
            </div>
            <div>
              <strong>Created:</strong>{' '}
              {submission.createdAt
                ? new Date(submission.createdAt).toLocaleString()
                : 'Unknown'}
            </div>
            {submission.reviewerUsername && (
              <div>
                <strong>Reviewer:</strong> {submission.reviewerUsername}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ---- Source Code Block ---- */}
      <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
        <div className="card-header">
          <h3>Source Code</h3>
          <span className="badge badge-primary">{submission.language}</span>
        </div>
        <div className="card-body">
          {/*
           * Code is rendered in a pre/code block with monospace font.
           * The code-block class (from App.css) provides appropriate styling
           * including background, border, and horizontal scroll for long lines.
           */}
          <pre className="code-block">
            <code>{submission.codeContent || submission.code || 'No code available.'}</code>
          </pre>
        </div>
      </div>

      {/* ---- Reviews Section ---- */}
      <div className="card">
        <div className="card-header">
          <h3>Reviews ({reviews.length})</h3>
        </div>
        <div className="card-body">
          {reviews.length === 0 ? (
            /* Empty state when no reviews exist for this submission */
            <div className="empty-state">
              <h3>No reviews yet</h3>
              <p>Be the first to review this submission.</p>
              <Link
                to={`/reviews/new?submissionId=${id}`}
                className="btn btn-primary"
              >
                Write a Review
              </Link>
            </div>
          ) : (
            /* Render each review as a card */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="card"
                  style={{ backgroundColor: 'var(--bg-surface-elevated)' }}
                >
                  {/* Review header: reviewer name and date */}
                  <div className="flex-between" style={{ marginBottom: 'var(--space-sm)' }}>
                    <strong>
                      {review.reviewerUsername || review.username || 'Anonymous'}
                    </strong>
                    <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
                      {review.createdAt
                        ? new Date(review.createdAt).toLocaleString()
                        : ''}
                    </span>
                  </div>

                  {/* Review comments */}
                  <p style={{ marginBottom: 'var(--space-sm)' }}>
                    {review.comments || 'No comments provided.'}
                  </p>

                  {/*
                   * Dimension ratings: display each rating dimension
                   * with its score if the review includes detailed ratings.
                   */}
                  {review.ratings && review.ratings.length > 0 && (
                    <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
                      {review.ratings.map((rating, index) => (
                        <span key={index} className="badge badge-info">
                          {rating.dimensionName || `Dimension ${rating.dimensionId}`}:{' '}
                          {rating.score}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Overall quality score if available */}
                  {review.qualityScore !== undefined && (
                    <div style={{ marginTop: 'var(--space-sm)' }}>
                      <strong>Quality Score:</strong>{' '}
                      <span className="badge badge-success">{review.qualityScore}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CodeSubmissionDetail;
