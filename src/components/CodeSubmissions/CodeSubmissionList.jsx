/**
 * CodeSubmissionList.jsx - Code Submission List Page Component
 *
 * Displays a filterable table of all code submissions in the platform.
 * Each row shows the submission's title, programming language, review status,
 * author, and creation date. Users can:
 * - Filter by submission status (PENDING_REVIEW, UNDER_REVIEW, REVIEWED)
 * - Filter by programming language
 * - Click a row to view the full submission detail
 * - Create a new submission via the "New Submission" button
 * - Delete their own submissions (with confirmation)
 *
 * Route: /submissions
 *
 * Dependencies:
 * - codeSubmissionService: API service for fetching and deleting submissions
 * - AuthContext: provides the current user's ID for ownership checks
 * - react-router-dom: navigation to detail and create views
 * - react-toastify: success/error notifications
 * - ConfirmDialog: modal confirmation for delete actions
 * - LoadingSpinner, ErrorMessage: shared UI feedback components
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import codeSubmissionService from '../../services/codeSubmissionService';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import ConfirmDialog from '../common/ConfirmDialog';

/* ---------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------- */

/** All possible submission statuses for the status filter dropdown */
const STATUS_OPTIONS = ['ALL', 'PENDING_REVIEW', 'UNDER_REVIEW', 'REVIEWED'];

/** All supported programming languages for the language filter dropdown */
const LANGUAGE_OPTIONS = [
  'ALL',
  'JAVA',
  'PYTHON',
  'JAVASCRIPT',
  'TYPESCRIPT',
  'CSHARP',
  'CPP',
  'GO',
  'RUBY',
  'PHP',
  'SWIFT',
  'KOTLIN',
  'RUST',
  'SQL',
  'HTML',
  'CSS',
  'OTHER',
];

/**
 * getStatusBadgeClass - Returns the CSS badge class for a given status.
 *
 * Maps submission statuses to visual badge variants so users can quickly
 * identify the review state of each submission.
 *
 * @param {string} status - The submission's review status
 * @returns {string} The CSS class name for the badge
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
 * CodeSubmissionList - Renders the submissions table with filtering and actions.
 *
 * @returns {JSX.Element} The submission list page UI
 */
function CodeSubmissionList() {
  /* ------ State ------ */
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* Filter state */
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [languageFilter, setLanguageFilter] = useState('ALL');

  /* Delete confirmation dialog state */
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  /* Auth and navigation */
  const { user } = useAuth();
  const navigate = useNavigate();

  /* ------ Data Fetching ------ */

  /**
   * fetchSubmissions - Loads all submissions from the backend.
   *
   * This fetches the complete list and filtering is done client-side
   * for simplicity. For large datasets the backend filter endpoints
   * (getByStatus, getByLanguage) could be used instead.
   */
  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await codeSubmissionService.getAll();
      setSubmissions(response.data || []);
    } catch (err) {
      console.error('Failed to fetch submissions:', err);
      setError(
        err.response?.data?.message || 'Failed to load submissions. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  /* Fetch submissions on initial mount */
  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  /* ------ Filtering ------ */

  /**
   * Apply client-side filters to the submissions array.
   * Both status and language filters are applied independently so
   * the user can combine them.
   */
  const filteredSubmissions = submissions.filter((sub) => {
    const matchesStatus =
      statusFilter === 'ALL' || sub.status === statusFilter;
    const matchesLanguage =
      languageFilter === 'ALL' || sub.language === languageFilter;
    return matchesStatus && matchesLanguage;
  });

  /* ------ Delete Handling ------ */

  /**
   * handleDeleteClick - Opens the confirmation dialog for a submission.
   *
   * @param {Object} submission - The submission to delete
   * @param {Event} e - The click event (stopped to prevent row navigation)
   */
  const handleDeleteClick = (submission, e) => {
    /* Prevent the click from bubbling to the row's onClick handler */
    e.stopPropagation();
    setDeleteTarget(submission);
    setShowConfirm(true);
  };

  /**
   * confirmDelete - Executes the deletion after user confirms.
   *
   * Calls the API to delete the submission and removes it from local
   * state to avoid a full refetch.
   */
  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await codeSubmissionService.delete(deleteTarget.id);
      /* Remove the deleted item from the local submissions array */
      setSubmissions((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      toast.success('Submission deleted successfully.');
    } catch (err) {
      console.error('Failed to delete submission:', err);
      toast.error(
        err.response?.data?.message || 'Failed to delete submission.'
      );
    } finally {
      setShowConfirm(false);
      setDeleteTarget(null);
    }
  };

  /* ------ Render ------ */

  if (loading) {
    return <LoadingSpinner message="Loading submissions..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchSubmissions} />;
  }

  return (
    <div>
      {/* Page header with title and "New Submission" action button */}
      <div className="page-header">
        <h1>Code Submissions</h1>
        <Link to="/submissions/new" className="btn btn-primary">
          + New Submission
        </Link>
      </div>

      {/* Filter controls: status and language dropdowns */}
      <div className="form-inline" style={{ marginBottom: 'var(--space-lg)' }}>
        {/* Status filter */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label htmlFor="status-filter">Status</label>
          <select
            id="status-filter"
            className="form-control"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status === 'ALL' ? 'All Statuses' : status.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>

        {/* Language filter */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label htmlFor="language-filter">Language</label>
          <select
            id="language-filter"
            className="form-control"
            value={languageFilter}
            onChange={(e) => setLanguageFilter(e.target.value)}
          >
            {LANGUAGE_OPTIONS.map((lang) => (
              <option key={lang} value={lang}>
                {lang === 'ALL' ? 'All Languages' : lang}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Submissions table */}
      {filteredSubmissions.length === 0 ? (
        /* Empty state when no submissions match the current filters */
        <div className="empty-state">
          <h3>No submissions found</h3>
          <p>
            {submissions.length === 0
              ? 'No code submissions have been created yet.'
              : 'No submissions match the selected filters.'}
          </p>
          {submissions.length === 0 && (
            <Link to="/submissions/new" className="btn btn-primary">
              Create Your First Submission
            </Link>
          )}
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Language</th>
                <th>Status</th>
                <th>Author</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubmissions.map((submission) => (
                <tr
                  key={submission.id}
                  className="clickable"
                  onClick={() => navigate(`/submissions/${submission.id}`)}
                >
                  {/* Submission title */}
                  <td>{submission.title}</td>

                  {/* Programming language badge */}
                  <td>
                    <span className="badge badge-primary">
                      {submission.language}
                    </span>
                  </td>

                  {/* Review status badge with colour coding */}
                  <td>
                    <span className={getStatusBadgeClass(submission.status)}>
                      {submission.status?.replace(/_/g, ' ')}
                    </span>
                  </td>

                  {/* Author / submitter username */}
                  <td>{submission.authorUsername || submission.username || 'Unknown'}</td>

                  {/* Creation date formatted for display */}
                  <td>
                    {submission.createdAt
                      ? new Date(submission.createdAt).toLocaleDateString()
                      : '-'}
                  </td>

                  {/* Action buttons */}
                  <td>
                    <div className="btn-group">
                      {/* View detail link */}
                      <Link
                        to={`/submissions/${submission.id}`}
                        className="btn btn-secondary btn-sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View
                      </Link>

                      {/*
                       * Delete button: only visible if the current user
                       * owns the submission. Compares the submission's
                       * userId/authorId with the logged-in user's ID.
                       */}
                      {(submission.userId === user?.userId ||
                        submission.authorId === user?.userId ||
                        submission.username === user?.username) && (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={(e) => handleDeleteClick(submission, e)}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        isOpen={showConfirm}
        title="Delete Submission"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowConfirm(false);
          setDeleteTarget(null);
        }}
        isDanger={true}
      />
    </div>
  );
}

export default CodeSubmissionList;
