/**
 * dateUtils.js - Date Formatting Utilities
 *
 * Provides consistent date and time formatting functions used
 * across the application. All functions accept either a Date object
 * or a date string that can be parsed by the Date constructor.
 *
 * Functions:
 * - formatDate:     Short date format (e.g., "02 Mar 2026")
 * - formatDateTime: Full date and time format (e.g., "02 Mar 2026, 14:30")
 * - timeAgo:        Human-readable relative time (e.g., "3 hours ago")
 */

/**
 * formatDate - Format a date value into a short, readable date string.
 *
 * Uses the "en-GB" locale to produce day-month-year ordering which is
 * unambiguous and commonly used in international contexts.
 *
 * @param {Date|string|number} dateValue - The date to format
 * @returns {string} Formatted date string, or "N/A" if the input is invalid
 *
 * @example
 * formatDate("2026-03-02T14:30:00Z"); // "02 Mar 2026"
 * formatDate(null);                   // "N/A"
 */
export function formatDate(dateValue) {
  /* Guard against null, undefined, or empty values */
  if (!dateValue) {
    return "N/A";
  }

  try {
    const date = new Date(dateValue);

    /* Check for invalid dates (NaN from the Date constructor) */
    if (isNaN(date.getTime())) {
      return "N/A";
    }

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch (error) {
    console.error("formatDate: failed to parse date value:", dateValue, error);
    return "N/A";
  }
}

/**
 * formatDateTime - Format a date value into a full date-and-time string.
 *
 * Includes hours and minutes in 24-hour format alongside the date.
 *
 * @param {Date|string|number} dateValue - The date to format
 * @returns {string} Formatted date-time string, or "N/A" if the input is invalid
 *
 * @example
 * formatDateTime("2026-03-02T14:30:00Z"); // "02 Mar 2026, 14:30"
 */
export function formatDateTime(dateValue) {
  if (!dateValue) {
    return "N/A";
  }

  try {
    const date = new Date(dateValue);

    if (isNaN(date.getTime())) {
      return "N/A";
    }

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch (error) {
    console.error("formatDateTime: failed to parse date value:", dateValue, error);
    return "N/A";
  }
}

/**
 * timeAgo - Convert a date value into a human-readable relative time string.
 *
 * Computes the difference between the given date and the current time,
 * then returns the most appropriate unit (seconds, minutes, hours, days,
 * weeks, months, or years).
 *
 * @param {Date|string|number} dateValue - The past date to compare against now
 * @returns {string} Relative time string (e.g., "5 minutes ago"), or "N/A"
 *
 * @example
 * // If current time is 2026-03-02T15:00:00Z
 * timeAgo("2026-03-02T14:57:00Z"); // "3 minutes ago"
 * timeAgo("2026-03-01T15:00:00Z"); // "1 day ago"
 * timeAgo("2026-02-02T15:00:00Z"); // "4 weeks ago"
 */
export function timeAgo(dateValue) {
  if (!dateValue) {
    return "N/A";
  }

  try {
    const date = new Date(dateValue);

    if (isNaN(date.getTime())) {
      return "N/A";
    }

    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    /* Handle future dates gracefully */
    if (diffInSeconds < 0) {
      return "just now";
    }

    /* Define time intervals in descending order of magnitude */
    const intervals = [
      { label: "year", seconds: 31536000 },   // 365 days
      { label: "month", seconds: 2592000 },    // 30 days
      { label: "week", seconds: 604800 },      // 7 days
      { label: "day", seconds: 86400 },        // 24 hours
      { label: "hour", seconds: 3600 },        // 60 minutes
      { label: "minute", seconds: 60 },        // 60 seconds
    ];

    /* Find the largest interval that fits */
    for (const interval of intervals) {
      const count = Math.floor(diffInSeconds / interval.seconds);
      if (count >= 1) {
        /* Pluralise the label when count is greater than 1 */
        const plural = count === 1 ? "" : "s";
        return `${count} ${interval.label}${plural} ago`;
      }
    }

    /* Less than a minute ago */
    return "just now";
  } catch (error) {
    console.error("timeAgo: failed to parse date value:", dateValue, error);
    return "N/A";
  }
}
