/**
 * ErrorMessage.jsx - Reusable Error Display Component
 *
 * Displays an error message in a styled banner with an optional retry
 * button. Used throughout the application when API calls fail or when
 * unexpected errors occur during data fetching.
 *
 * The component uses the semantic danger colour scheme defined in App.css
 * custom properties to visually distinguish errors from other content.
 *
 * Usage:
 *   <ErrorMessage message="Failed to load submissions." />
 *   <ErrorMessage message="Network error." onRetry={() => fetchData()} />
 */

import React from 'react';

/**
 * ErrorMessage - Renders an error banner with message and optional retry action.
 *
 * @param {Object} props
 * @param {string} [props.message='An unexpected error occurred.'] - The error description
 * @param {Function} [props.onRetry] - Callback invoked when the retry button is clicked
 * @returns {JSX.Element} The error message UI
 */
function ErrorMessage({ message = 'An unexpected error occurred.', onRetry }) {
  return (
    <div className="form-error-banner" role="alert">
      {/* Error message text */}
      <p style={{ margin: 0 }}>{message}</p>

      {/*
       * Retry button is only rendered when an onRetry callback is provided.
       * This allows the parent component to re-attempt the failed operation
       * (e.g., refetch data from the API).
       */}
      {onRetry && (
        <button
          className="btn btn-danger btn-sm"
          onClick={onRetry}
          style={{ marginTop: 'var(--space-sm)' }}
        >
          Try Again
        </button>
      )}
    </div>
  );
}

export default ErrorMessage;
