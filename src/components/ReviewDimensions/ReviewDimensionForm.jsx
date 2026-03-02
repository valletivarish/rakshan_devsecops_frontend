/**
 * ReviewDimensionForm.jsx - Review Dimension Create/Edit Form Component
 *
 * Inline form for creating or editing a review dimension. A review dimension
 * represents a criterion used to evaluate code during peer review, such as
 * "Readability", "Performance", or "Security".
 *
 * Fields:
 * - name: the dimension name (e.g., "Code Readability")
 * - description: explanation of what this dimension measures
 * - maxScore: the maximum score a reviewer can assign (1-10)
 *
 * This component is rendered inline within the ReviewDimensionList page
 * rather than as a separate route. It receives props for the dimension
 * being edited (null for create), and callbacks for success/cancel.
 *
 * Dependencies:
 * - react-hook-form + yup: form state management and validation
 * - reviewDimensionService: API service for create/update
 * - react-toastify: success/error notifications
 */

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import reviewDimensionService from '../../services/reviewDimensionService';

/* ---------------------------------------------------------------------------
 * Validation Schema
 * Validates all dimension form fields before submission.
 * ------------------------------------------------------------------------- */
const dimensionSchema = yup.object().shape({
  /** Dimension name is required and limited in length */
  name: yup
    .string()
    .required('Dimension name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must not exceed 50 characters'),

  /** Description is optional but limited to 200 characters */
  description: yup
    .string()
    .max(200, 'Description must not exceed 200 characters'),

  /** Max score must be a number between 1 and 10 */
  maxScore: yup
    .number()
    .typeError('Max score must be a number')
    .required('Max score is required')
    .min(1, 'Max score must be at least 1')
    .max(10, 'Max score must not exceed 10')
    .integer('Max score must be a whole number'),
});

/**
 * ReviewDimensionForm - Inline form for creating or editing a dimension.
 *
 * In edit mode, the form is pre-populated with the existing dimension's
 * data. In create mode, fields start empty with a default maxScore of 5.
 *
 * @param {Object} props
 * @param {Object|null} props.dimension - The dimension to edit, or null for create mode
 * @param {Function} props.onSuccess - Callback invoked after successful save
 * @param {Function} props.onCancel - Callback invoked when the user cancels
 * @returns {JSX.Element} The dimension form UI
 */
function ReviewDimensionForm({ dimension, onSuccess, onCancel }) {
  /* Determine if we are in edit mode based on whether a dimension was passed */
  const isEditMode = Boolean(dimension);

  /* Local state for tracking the API request progress */
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* Initialise react-hook-form with yup validation */
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(dimensionSchema),
    defaultValues: {
      name: '',
      description: '',
      maxScore: 5,
    },
  });

  /* ------ Pre-populate form in edit mode ------ */

  useEffect(() => {
    if (dimension) {
      /*
       * Reset the form with the existing dimension's values.
       * This populates all fields when switching from create to edit mode.
       */
      reset({
        name: dimension.name || '',
        description: dimension.description || '',
        maxScore: dimension.maxScore || 5,
      });
    } else {
      /* Reset to defaults when switching to create mode */
      reset({
        name: '',
        description: '',
        maxScore: 5,
      });
    }
  }, [dimension, reset]);

  /* ------ Form Submission ------ */

  /**
   * onSubmit - Handles form submission after validation.
   *
   * Creates or updates a dimension based on the current mode.
   * On success, calls the onSuccess callback to close the form
   * and trigger a list refresh.
   *
   * @param {Object} data - Validated form data { name, description, maxScore }
   */
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      if (isEditMode) {
        /* Update existing dimension */
        await reviewDimensionService.update(dimension.id, data);
        toast.success(`Dimension "${data.name}" updated successfully.`);
      } else {
        /* Create new dimension */
        await reviewDimensionService.create(data);
        toast.success(`Dimension "${data.name}" created successfully.`);
      }

      /* Notify the parent to close the form and refresh the list */
      onSuccess();
    } catch (err) {
      console.error('Failed to save dimension:', err);
      toast.error(
        err.response?.data?.message || 'Failed to save dimension. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card">
      {/* Form title */}
      <div className="card-header">
        <h3>{isEditMode ? 'Edit Dimension' : 'Add New Dimension'}</h3>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Name field */}
        <div className="form-group">
          <label htmlFor="dim-name">Dimension Name</label>
          <input
            id="dim-name"
            type="text"
            className={`form-control ${errors.name ? 'error' : ''}`}
            placeholder="e.g., Code Readability, Performance, Security"
            {...register('name')}
          />
          {errors.name && (
            <p className="form-error">{errors.name.message}</p>
          )}
        </div>

        {/* Description field */}
        <div className="form-group">
          <label htmlFor="dim-description">Description</label>
          <textarea
            id="dim-description"
            className={`form-control ${errors.description ? 'error' : ''}`}
            placeholder="Describe what this dimension measures and how to score it"
            rows={3}
            {...register('description')}
          />
          {errors.description && (
            <p className="form-error">{errors.description.message}</p>
          )}
        </div>

        {/* Max Score field */}
        <div className="form-group">
          <label htmlFor="dim-maxScore">Max Score (1-10)</label>
          <input
            id="dim-maxScore"
            type="number"
            min={1}
            max={10}
            className={`form-control ${errors.maxScore ? 'error' : ''}`}
            style={{ maxWidth: '120px' }}
            {...register('maxScore')}
          />
          {errors.maxScore && (
            <p className="form-error">{errors.maxScore.message}</p>
          )}
        </div>

        {/* Action buttons: Save and Cancel */}
        <div className="btn-group">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? 'Saving...'
              : isEditMode
                ? 'Update Dimension'
                : 'Create Dimension'}
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default ReviewDimensionForm;
