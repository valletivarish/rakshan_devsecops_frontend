/**
 * CodeSubmissionForm.jsx - Code Submission Create/Edit Form Component
 *
 * Renders a form for creating or editing a code submission. Fields include:
 * - title: short descriptive title for the submission
 * - description: longer explanation or context for the code
 * - code: the actual source code (displayed in a monospace textarea)
 * - language: programming language selected from a predefined enum list
 *
 * Form validation is handled by react-hook-form with a yup schema.
 * In edit mode, the form is pre-populated with the existing submission data.
 *
 * Routes: /submissions/new (create), /submissions/:id/edit (edit)
 *
 * Dependencies:
 * - react-hook-form + yup: form state management and validation
 * - codeSubmissionService: API service for create/update operations
 * - react-router-dom: navigation and route parameter extraction
 * - react-toastify: success/error notifications
 * - LoadingSpinner: loading indicator during data fetch (edit mode)
 */

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import codeSubmissionService from '../../services/codeSubmissionService';
import LoadingSpinner from '../common/LoadingSpinner';

/* ---------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------- */

/**
 * LANGUAGE_OPTIONS - All supported programming languages.
 *
 * These values map to the Language enum on the backend. The user selects
 * one from a dropdown and it is sent as a string to the API.
 */
const LANGUAGE_OPTIONS = [
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

/* ---------------------------------------------------------------------------
 * Validation Schema
 * Defines constraints for every form field. Yup validates on submission
 * and on blur (depending on react-hook-form mode configuration).
 * ------------------------------------------------------------------------- */
const submissionSchema = yup.object().shape({
  /** Title is required and must be between 3 and 100 characters */
  title: yup
    .string()
    .required('Title is required')
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must not exceed 100 characters'),

  /** Description is optional but has a max length if provided */
  description: yup
    .string()
    .max(500, 'Description must not exceed 500 characters'),

  /** Code content is required and must have a minimum length */
  codeContent: yup
    .string()
    .required('Code is required')
    .min(10, 'Code must be at least 10 characters'),

  /** Language must be one of the predefined enum values */
  language: yup
    .string()
    .required('Please select a programming language')
    .oneOf(LANGUAGE_OPTIONS, 'Invalid language selection'),
});

/**
 * CodeSubmissionForm - Renders a validated form for creating or editing submissions.
 *
 * Determines create vs. edit mode based on the presence of an `id` URL parameter.
 * In edit mode, the existing submission is fetched and used to pre-populate fields.
 *
 * @returns {JSX.Element} The submission form UI
 */
function CodeSubmissionForm() {
  /* Extract the submission ID from the URL (undefined for create mode) */
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const navigate = useNavigate();

  /* Local state for tracking API request progress and initial data loading */
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(isEditMode);

  /* Initialise react-hook-form with yup resolver */
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(submissionSchema),
    defaultValues: {
      title: '',
      description: '',
      codeContent: '',
      language: '',
    },
  });

  /* ------ Load Existing Submission (Edit Mode) ------ */

  useEffect(() => {
    if (!isEditMode) return;

    /**
     * Fetch the existing submission by ID and populate the form fields.
     * Uses react-hook-form's reset() to set all field values at once.
     */
    const loadSubmission = async () => {
      try {
        const response = await codeSubmissionService.getById(id);
        const data = response.data;

        /* Reset form with existing values */
        reset({
          title: data.title || '',
          description: data.description || '',
          codeContent: data.codeContent || data.code || '',
          language: data.language || '',
        });
      } catch (err) {
        console.error('Failed to load submission for editing:', err);
        toast.error('Failed to load submission. Redirecting to list.');
        navigate('/submissions');
      } finally {
        setLoadingExisting(false);
      }
    };

    loadSubmission();
  }, [id, isEditMode, reset, navigate]);

  /* ------ Form Submission ------ */

  /**
   * onSubmit - Handles form submission after validation passes.
   *
   * Creates a new submission or updates an existing one depending on
   * whether we are in create or edit mode. On success, navigates
   * to the submissions list.
   *
   * @param {Object} data - Validated form data
   */
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      if (isEditMode) {
        /* Update existing submission */
        await codeSubmissionService.update(id, data);
        toast.success('Submission updated successfully.');
      } else {
        /* Create new submission */
        await codeSubmissionService.create(data);
        toast.success('Submission created successfully.');
      }

      /* Navigate back to the submissions list */
      navigate('/submissions');
    } catch (err) {
      console.error('Failed to save submission:', err);
      toast.error(
        err.response?.data?.message || 'Failed to save submission. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ------ Render ------ */

  /* Show loading spinner while fetching existing data in edit mode */
  if (loadingExisting) {
    return <LoadingSpinner message="Loading submission..." />;
  }

  return (
    <div>
      {/* Page header - different title for create vs. edit */}
      <div className="page-header">
        <h1>{isEditMode ? 'Edit Submission' : 'New Submission'}</h1>
      </div>

      {/* Submission form card */}
      <div className="card">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Title field */}
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              type="text"
              className={`form-control ${errors.title ? 'error' : ''}`}
              placeholder="Enter a descriptive title for your code"
              {...register('title')}
            />
            {errors.title && (
              <p className="form-error">{errors.title.message}</p>
            )}
          </div>

          {/* Description field */}
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              className={`form-control ${errors.description ? 'error' : ''}`}
              placeholder="Provide context about what your code does and what you want reviewed"
              rows={3}
              {...register('description')}
            />
            {errors.description && (
              <p className="form-error">{errors.description.message}</p>
            )}
          </div>

          {/* Code content field with monospace font */}
          <div className="form-group">
            <label htmlFor="codeContent">Code</label>
            <textarea
              id="codeContent"
              className={`form-control ${errors.codeContent ? 'error' : ''}`}
              placeholder="Paste your source code here..."
              rows={12}
              style={{
                fontFamily: '"Fira Code", "Cascadia Code", "JetBrains Mono", monospace',
                fontSize: 'var(--font-sm)',
                lineHeight: 1.6,
                tabSize: 4,
              }}
              {...register('codeContent')}
            />
            {errors.codeContent && (
              <p className="form-error">{errors.codeContent.message}</p>
            )}
          </div>

          {/* Language selection dropdown */}
          <div className="form-group">
            <label htmlFor="language">Programming Language</label>
            <select
              id="language"
              className={`form-control ${errors.language ? 'error' : ''}`}
              {...register('language')}
            >
              <option value="">-- Select a language --</option>
              {LANGUAGE_OPTIONS.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
            {errors.language && (
              <p className="form-error">{errors.language.message}</p>
            )}
          </div>

          {/* Action buttons: Submit and Cancel */}
          <div className="btn-group">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? 'Saving...'
                : isEditMode
                  ? 'Update Submission'
                  : 'Create Submission'}
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/submissions')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CodeSubmissionForm;
