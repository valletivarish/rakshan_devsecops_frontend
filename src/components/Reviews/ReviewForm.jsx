/**
 * ReviewForm.jsx - Create Review Form Component
 *
 * Renders a form for creating a new peer code review. The form includes:
 * - A dropdown to select which submission to review (filtered to UNDER_REVIEW
 *   status, with an option to show all submissions)
 * - A comments textarea for written feedback
 * - Dynamic dimension rating inputs: fetches all review dimensions from the
 *   backend and renders a numeric input (slider + number) for each one,
 *   allowing the reviewer to score the code on each criterion
 *
 * The submission can be pre-selected via a `submissionId` query parameter
 * in the URL (e.g., /reviews/new?submissionId=5), which is used when
 * navigating from the submission detail page.
 *
 * Route: /reviews/new
 *
 * Dependencies:
 * - react-hook-form: form state management (dynamic fields for dimensions)
 * - codeSubmissionService: fetch submissions for the dropdown
 * - reviewDimensionService: fetch all review dimensions for rating inputs
 * - reviewService: submit the new review
 * - react-router-dom: navigation and query parameter access
 * - react-toastify: success/error notifications
 * - LoadingSpinner: loading indicator during data fetch
 */

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import codeSubmissionService from '../../services/codeSubmissionService';
import reviewDimensionService from '../../services/reviewDimensionService';
import reviewService from '../../services/reviewService';
import LoadingSpinner from '../common/LoadingSpinner';

/**
 * ReviewForm - Renders the review creation form with dynamic dimension ratings.
 *
 * On mount, fetches both the list of submissions and the list of review
 * dimensions. The dimension ratings are rendered dynamically as a set of
 * slider + number input pairs, one per dimension.
 *
 * @returns {JSX.Element} The review form UI
 */
function ReviewForm() {
  const navigate = useNavigate();

  /* Extract the optional submissionId from the URL query string */
  const [searchParams] = useSearchParams();
  const preSelectedSubmissionId = searchParams.get('submissionId');

  /* ------ State ------ */
  const [submissions, setSubmissions] = useState([]);
  const [dimensions, setDimensions] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* Initialise react-hook-form */
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      submissionId: preSelectedSubmissionId || '',
      comments: '',
      ratings: [],
    },
  });

  /* Watch the ratings array for real-time value display */
  const watchedRatings = watch('ratings');

  /* ------ Data Fetching ------ */

  useEffect(() => {
    /**
     * loadFormData - Fetches submissions and dimensions in parallel.
     *
     * Submissions are needed for the dropdown selector and dimensions
     * are needed to render the dynamic rating inputs.
     */
    const loadFormData = async () => {
      try {
        const [submissionsRes, dimensionsRes] = await Promise.all([
          codeSubmissionService.getAll(),
          reviewDimensionService.getAll(),
        ]);

        setSubmissions(submissionsRes.data || []);
        setDimensions(dimensionsRes.data || []);

        /*
         * Initialise the ratings array with default values for each dimension.
         * Each rating object contains the dimension ID and an initial score of 1.
         */
        const dimensionData = dimensionsRes.data || [];
        const defaultRatings = dimensionData.map((dim) => ({
          dimensionId: dim.id,
          score: 1,
        }));
        setValue('ratings', defaultRatings);

        /* Pre-select the submission if an ID was provided in the URL */
        if (preSelectedSubmissionId) {
          setValue('submissionId', preSelectedSubmissionId);
        }
      } catch (err) {
        console.error('Failed to load form data:', err);
        toast.error('Failed to load form data. Please try again.');
      } finally {
        setLoadingData(false);
      }
    };

    loadFormData();
  }, [setValue, preSelectedSubmissionId]);

  /* ------ Form Submission ------ */

  /**
   * onSubmit - Handles form submission.
   *
   * Constructs the review payload including the submission ID, comments,
   * and an array of dimension ratings. Sends it to the reviewService.create()
   * endpoint.
   *
   * @param {Object} data - Form data from react-hook-form
   */
  const onSubmit = async (data) => {
    /* Validate that a submission has been selected */
    if (!data.submissionId) {
      toast.error('Please select a submission to review.');
      return;
    }

    setIsSubmitting(true);
    try {
      /*
       * Build the review payload. The backend expects:
       * - submissionId: the ID of the code submission being reviewed
       * - comments: the reviewer's written feedback
       * - ratings: array of { dimensionId, score } objects
       */
      const payload = {
        submissionId: Number(data.submissionId) || data.submissionId,
        codeSubmissionId: Number(data.submissionId) || data.submissionId,
        comments: data.comments,
        ratings: data.ratings.map((r) => ({
          dimensionId: r.dimensionId,
          score: Number(r.score),
        })),
      };

      await reviewService.create(payload);
      toast.success('Review submitted successfully.');
      navigate('/reviews');
    } catch (err) {
      console.error('Failed to submit review:', err);
      toast.error(
        err.response?.data?.message || 'Failed to submit review. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * handleRatingChange - Updates a specific dimension's score in the ratings array.
   *
   * @param {number} index - The index of the dimension in the ratings array
   * @param {number} value - The new score value
   */
  const handleRatingChange = (index, value) => {
    setValue(`ratings.${index}.score`, Number(value));
  };

  /* ------ Render ------ */

  if (loadingData) {
    return <LoadingSpinner message="Loading review form data..." />;
  }

  /*
   * Filter submissions to show those with UNDER_REVIEW status first,
   * but include all submissions so the reviewer has flexibility.
   */
  const sortedSubmissions = [...submissions].sort((a, b) => {
    /* Prioritise UNDER_REVIEW submissions at the top */
    if (a.status === 'UNDER_REVIEW' && b.status !== 'UNDER_REVIEW') return -1;
    if (b.status === 'UNDER_REVIEW' && a.status !== 'UNDER_REVIEW') return 1;
    return 0;
  });

  return (
    <div>
      {/* Page header */}
      <div className="page-header">
        <h1>Write a Review</h1>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Submission selection dropdown */}
          <div className="form-group">
            <label htmlFor="submissionId">Select Submission to Review</label>
            <select
              id="submissionId"
              className={`form-control ${errors.submissionId ? 'error' : ''}`}
              {...register('submissionId', { required: 'Please select a submission' })}
            >
              <option value="">-- Select a submission --</option>
              {sortedSubmissions.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.title} [{sub.language}] - {sub.status?.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
            {errors.submissionId && (
              <p className="form-error">{errors.submissionId.message}</p>
            )}
          </div>

          {/* Comments textarea */}
          <div className="form-group">
            <label htmlFor="comments">Review Comments</label>
            <textarea
              id="comments"
              className={`form-control ${errors.comments ? 'error' : ''}`}
              placeholder="Provide detailed feedback on the code quality, suggestions for improvement, and any issues found..."
              rows={6}
              {...register('comments', {
                required: 'Review comments are required',
                minLength: {
                  value: 10,
                  message: 'Comments must be at least 10 characters',
                },
              })}
            />
            {errors.comments && (
              <p className="form-error">{errors.comments.message}</p>
            )}
          </div>

          {/* ---- Dynamic Dimension Ratings Section ---- */}
          {dimensions.length > 0 && (
            <div className="form-group">
              <label>Dimension Ratings</label>
              <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-md)' }}>
                Rate the code on each dimension below. Use the slider or type a value directly.
              </p>

              {dimensions.map((dimension, index) => (
                <div
                  key={dimension.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-md)',
                    marginBottom: 'var(--space-md)',
                    padding: 'var(--space-sm) var(--space-md)',
                    backgroundColor: 'var(--bg-surface-elevated)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  {/* Hidden field to track the dimension ID */}
                  <input
                    type="hidden"
                    {...register(`ratings.${index}.dimensionId`)}
                    value={dimension.id}
                  />

                  {/* Dimension name and description */}
                  <div style={{ flex: 1, minWidth: '150px' }}>
                    <strong style={{ fontSize: 'var(--font-sm)' }}>
                      {dimension.name}
                    </strong>
                    {dimension.description && (
                      <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                        {dimension.description}
                      </p>
                    )}
                  </div>

                  {/*
                   * Range slider for visual score selection.
                   * The min/max are 1 and the dimension's maxScore (defaulting to 5).
                   */}
                  <input
                    type="range"
                    min={1}
                    max={dimension.maxScore || 5}
                    step={1}
                    value={watchedRatings?.[index]?.score || 1}
                    onChange={(e) => handleRatingChange(index, e.target.value)}
                    style={{ flex: 1, minWidth: '100px', accentColor: 'var(--color-primary)' }}
                  />

                  {/* Numeric input for direct score entry */}
                  <input
                    type="number"
                    min={1}
                    max={dimension.maxScore || 5}
                    className="form-control"
                    style={{ width: '70px', textAlign: 'center' }}
                    {...register(`ratings.${index}.score`, {
                      min: 1,
                      max: dimension.maxScore || 5,
                    })}
                    onChange={(e) => handleRatingChange(index, e.target.value)}
                  />

                  {/* Max score label */}
                  <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', minWidth: '40px' }}>
                    / {dimension.maxScore || 5}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Info message when no dimensions are configured */}
          {dimensions.length === 0 && (
            <div
              className="form-error-banner"
              style={{
                backgroundColor: 'var(--color-info-light)',
                borderColor: 'var(--color-info)',
                color: 'var(--color-info)',
              }}
            >
              No review dimensions have been configured yet. You can still submit a review
              with comments only. Ask an administrator to add dimensions in the Dimensions section.
            </div>
          )}

          {/* Action buttons */}
          <div className="btn-group">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/reviews')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReviewForm;
