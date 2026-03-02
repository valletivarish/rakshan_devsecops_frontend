/**
 * ReviewDimensionList.jsx - Review Dimensions List Page Component
 *
 * Displays a table of all review dimensions (criteria used to evaluate code)
 * with full CRUD functionality. Each dimension has a name, description,
 * and maximum score that reviewers use when rating submissions.
 *
 * Features:
 * - Table listing all dimensions with name, description, and max score
 * - Inline add/edit form that appears above the table
 * - Edit and Delete buttons for each dimension row
 * - Confirmation dialog before deleting a dimension
 *
 * Route: /dimensions
 *
 * Dependencies:
 * - reviewDimensionService: API service for CRUD operations on dimensions
 * - ReviewDimensionForm: inline form component for add/edit
 * - react-toastify: success/error notifications
 * - ConfirmDialog: modal confirmation for delete actions
 * - LoadingSpinner, ErrorMessage: shared UI feedback components
 */

import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import reviewDimensionService from '../../services/reviewDimensionService';
import ReviewDimensionForm from './ReviewDimensionForm';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import ConfirmDialog from '../common/ConfirmDialog';

/**
 * ReviewDimensionList - Renders the dimensions management page.
 *
 * Manages the list of review dimensions with add, edit, and delete
 * capabilities. The add/edit form is shown inline above the table
 * when the user clicks "Add Dimension" or "Edit" on a row.
 *
 * @returns {JSX.Element} The dimensions list page UI
 */
function ReviewDimensionList() {
  /* ------ State ------ */
  const [dimensions, setDimensions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* Form visibility and editing state */
  const [showForm, setShowForm] = useState(false);
  const [editingDimension, setEditingDimension] = useState(null);

  /* Delete confirmation dialog state */
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  /* ------ Data Fetching ------ */

  /**
   * fetchDimensions - Loads all review dimensions from the backend.
   *
   * Called on mount and after successful create, update, or delete
   * operations to keep the list in sync with the server.
   */
  const fetchDimensions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await reviewDimensionService.getAll();
      setDimensions(response.data || []);
    } catch (err) {
      console.error('Failed to fetch dimensions:', err);
      setError(
        err.response?.data?.message || 'Failed to load review dimensions.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  /* Fetch dimensions on initial mount */
  useEffect(() => {
    fetchDimensions();
  }, [fetchDimensions]);

  /* ------ Add / Edit Handlers ------ */

  /**
   * handleAddClick - Shows the inline form in "create" mode.
   *
   * Clears any editing state and reveals the form component.
   */
  const handleAddClick = () => {
    setEditingDimension(null);
    setShowForm(true);
  };

  /**
   * handleEditClick - Shows the inline form in "edit" mode.
   *
   * Pre-populates the form with the selected dimension's data.
   *
   * @param {Object} dimension - The dimension to edit
   */
  const handleEditClick = (dimension) => {
    setEditingDimension(dimension);
    setShowForm(true);
  };

  /**
   * handleFormCancel - Hides the inline form and clears editing state.
   */
  const handleFormCancel = () => {
    setShowForm(false);
    setEditingDimension(null);
  };

  /**
   * handleFormSuccess - Called after a successful create or update.
   *
   * Hides the form, clears editing state, and refetches the dimensions
   * list to reflect the changes.
   */
  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingDimension(null);
    fetchDimensions();
  };

  /* ------ Delete Handlers ------ */

  /**
   * handleDeleteClick - Opens the confirmation dialog for a dimension.
   *
   * @param {Object} dimension - The dimension to delete
   */
  const handleDeleteClick = (dimension) => {
    setDeleteTarget(dimension);
    setShowConfirm(true);
  };

  /**
   * confirmDelete - Executes the deletion after user confirms.
   *
   * Sends the delete request to the API and removes the dimension
   * from local state on success.
   */
  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await reviewDimensionService.delete(deleteTarget.id);
      /* Remove from local state to avoid a full refetch */
      setDimensions((prev) => prev.filter((d) => d.id !== deleteTarget.id));
      toast.success(`Dimension "${deleteTarget.name}" deleted successfully.`);
    } catch (err) {
      console.error('Failed to delete dimension:', err);
      toast.error(
        err.response?.data?.message || 'Failed to delete dimension.'
      );
    } finally {
      setShowConfirm(false);
      setDeleteTarget(null);
    }
  };

  /* ------ Render ------ */

  if (loading) {
    return <LoadingSpinner message="Loading review dimensions..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchDimensions} />;
  }

  return (
    <div>
      {/* Page header with title and "Add Dimension" button */}
      <div className="page-header">
        <h1>Review Dimensions</h1>
        {!showForm && (
          <button className="btn btn-primary" onClick={handleAddClick}>
            + Add Dimension
          </button>
        )}
      </div>

      {/*
       * Inline add/edit form - shown above the table when the user
       * clicks "Add Dimension" or "Edit" on a row. The form receives
       * the dimension to edit (or null for create mode) and callbacks
       * for success and cancellation.
       */}
      {showForm && (
        <div style={{ marginBottom: 'var(--space-lg)' }}>
          <ReviewDimensionForm
            dimension={editingDimension}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </div>
      )}

      {/* Dimensions table or empty state */}
      {dimensions.length === 0 ? (
        <div className="empty-state">
          <h3>No dimensions configured</h3>
          <p>
            Review dimensions define the criteria used to evaluate code.
            Add dimensions like Readability, Performance, Security, etc.
          </p>
          <button className="btn btn-primary" onClick={handleAddClick}>
            Add Your First Dimension
          </button>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Max Score</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {dimensions.map((dimension) => (
                <tr key={dimension.id}>
                  {/* Dimension name */}
                  <td>
                    <strong>{dimension.name}</strong>
                  </td>

                  {/* Dimension description */}
                  <td>{dimension.description || '-'}</td>

                  {/* Maximum score for this dimension */}
                  <td>
                    <span className="badge badge-primary">
                      {dimension.maxScore}
                    </span>
                  </td>

                  {/* Edit and Delete action buttons */}
                  <td>
                    <div className="btn-group">
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleEditClick(dimension)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteClick(dimension)}
                      >
                        Delete
                      </button>
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
        title="Delete Dimension"
        message={`Are you sure you want to delete the "${deleteTarget?.name}" dimension? This may affect existing reviews that use this dimension.`}
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

export default ReviewDimensionList;
