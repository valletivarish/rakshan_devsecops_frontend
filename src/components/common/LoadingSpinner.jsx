/**
 * LoadingSpinner.jsx - Reusable Loading Indicator Component
 *
 * Displays a CSS-animated spinner with an optional message to indicate
 * that content is being loaded. Uses the .loading-spinner and
 * .loading-container CSS classes defined in App.css which create a
 * rotating border animation.
 *
 * Usage:
 *   <LoadingSpinner />
 *   <LoadingSpinner message="Fetching submissions..." />
 *
 * The spinner is centred vertically and horizontally within its container.
 */

import React from 'react';

/**
 * LoadingSpinner - Renders a centred loading animation with optional text.
 *
 * @param {Object} props
 * @param {string} [props.message='Loading...'] - Text displayed below the spinner
 * @returns {JSX.Element} The loading spinner UI
 */
function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="loading-container">
      {/* Animated CSS spinner - styled via .loading-spinner in App.css */}
      <div className="loading-spinner" />

      {/* Optional descriptive message below the spinner */}
      {message && <p>{message}</p>}
    </div>
  );
}

export default LoadingSpinner;
