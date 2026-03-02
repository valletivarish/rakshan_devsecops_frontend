/**
 * formatUtils.js - General Formatting Utilities
 *
 * Provides reusable formatting functions for displaying data
 * consistently across the application.
 *
 * Functions:
 * - formatScore:       Format a numeric score with fixed decimal precision
 * - truncateText:      Shorten a text string to a maximum length
 * - getLanguageColor:  Return a CSS colour associated with a programming language
 */

/**
 * formatScore - Format a numeric score for display.
 *
 * Rounds the score to the specified number of decimal places and
 * returns it as a string. Handles null/undefined inputs gracefully.
 *
 * @param {number|null|undefined} score    - The numeric score to format
 * @param {number}                [decimals=1] - Number of decimal places
 * @returns {string} The formatted score string, or "N/A" if the input is invalid
 *
 * @example
 * formatScore(8.567);    // "8.6"
 * formatScore(8.567, 2); // "8.57"
 * formatScore(null);     // "N/A"
 * formatScore(10, 0);    // "10"
 */
export function formatScore(score, decimals = 1) {
  /* Guard against null, undefined, or non-numeric values */
  if (score === null || score === undefined || isNaN(score)) {
    return "N/A";
  }

  return Number(score).toFixed(decimals);
}

/**
 * truncateText - Shorten a text string to a specified maximum length.
 *
 * If the text exceeds the maximum length, it is truncated and an
 * ellipsis ("...") is appended. The ellipsis is included in the
 * total character count so the result never exceeds maxLength + 3.
 *
 * @param {string|null|undefined} text          - The text to truncate
 * @param {number}                [maxLength=100] - Maximum number of characters before truncation
 * @returns {string} The original or truncated text, or an empty string if the input is falsy
 *
 * @example
 * truncateText("Hello, World!", 5);  // "Hello..."
 * truncateText("Short", 100);       // "Short"
 * truncateText(null);               // ""
 */
export function truncateText(text, maxLength = 100) {
  if (!text) {
    return "";
  }

  /* Convert to string in case a non-string value is passed */
  const str = String(text);

  if (str.length <= maxLength) {
    return str;
  }

  return str.substring(0, maxLength) + "...";
}

/**
 * LANGUAGE_COLORS - Mapping of programming language names to display colours.
 *
 * These colours are loosely based on the conventions used by GitHub's
 * linguist library and provide visual differentiation in UI elements
 * like badges and tags.
 *
 * Keys are stored in lowercase for case-insensitive lookup.
 */
const LANGUAGE_COLORS = {
  java: "#b07219",
  javascript: "#f1e05a",
  typescript: "#3178c6",
  python: "#3572a5",
  go: "#00add8",
  rust: "#dea584",
  "c++": "#f34b7d",
  cpp: "#f34b7d",
  c: "#555555",
  "c#": "#178600",
  csharp: "#178600",
  ruby: "#701516",
  php: "#4f5d95",
  swift: "#f05138",
  kotlin: "#a97bff",
  scala: "#c22d40",
  html: "#e34c26",
  css: "#563d7c",
  sql: "#e38c00",
  shell: "#89e051",
  bash: "#89e051",
  dart: "#00b4ab",
  r: "#198ce7",
  matlab: "#e16737",
  perl: "#0298c3",
  haskell: "#5e5086",
  lua: "#000080",
  elixir: "#6e4a7e",
  clojure: "#db5855",
};

/**
 * DEFAULT_LANGUAGE_COLOR - Fallback colour used when a language is not
 * found in the LANGUAGE_COLORS map.
 */
const DEFAULT_LANGUAGE_COLOR = "#8b8b8b";

/**
 * getLanguageColor - Retrieve the display colour for a programming language.
 *
 * The lookup is case-insensitive. If the language is not found in the
 * predefined map, a neutral grey colour is returned as a fallback.
 *
 * @param {string|null|undefined} language - The programming language name
 * @returns {string} A CSS colour string (hex format)
 *
 * @example
 * getLanguageColor("Java");       // "#b07219"
 * getLanguageColor("javascript"); // "#f1e05a"
 * getLanguageColor("Unknown");    // "#8b8b8b"
 * getLanguageColor(null);         // "#8b8b8b"
 */
export function getLanguageColor(language) {
  if (!language) {
    return DEFAULT_LANGUAGE_COLOR;
  }

  const normalised = language.toLowerCase().trim();
  return LANGUAGE_COLORS[normalised] || DEFAULT_LANGUAGE_COLOR;
}
