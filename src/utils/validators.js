/**
 * validators.js - Yup Validation Schemas
 *
 * Centralised validation schemas used by form components throughout the
 * application. Each schema defines the shape, type, and constraints for
 * form data before it is submitted to the backend API.
 *
 * Schemas:
 * - loginSchema:           Validates login form fields
 * - registerSchema:        Validates registration form fields
 * - codeSubmissionSchema:  Validates new code submission forms
 * - reviewSchema:          Validates review creation/edit forms
 * - reviewDimensionSchema: Validates review dimension management forms
 *
 * Using Yup provides declarative, composable validation with clear
 * error messages that can be rendered next to form fields.
 */

import * as Yup from "yup";

/* ---------------------------------------------------------------------------
 * LOGIN SCHEMA
 *
 * Requires a non-empty username and a password with a minimum length
 * of 6 characters to match typical backend password policies.
 * ------------------------------------------------------------------------- */
export const loginSchema = Yup.object().shape({
  /**
   * Username field - required, must not be blank.
   */
  username: Yup.string()
    .trim()
    .required("Username is required."),

  /**
   * Password field - required, minimum 6 characters.
   */
  password: Yup.string()
    .required("Password is required.")
    .min(6, "Password must be at least 6 characters."),
});

/* ---------------------------------------------------------------------------
 * REGISTER SCHEMA
 *
 * Extends the login schema with an email field and a password
 * confirmation field to prevent typos during registration.
 * ------------------------------------------------------------------------- */
export const registerSchema = Yup.object().shape({
  /**
   * Username - required, alphanumeric with underscores, 3-30 characters.
   */
  username: Yup.string()
    .trim()
    .required("Username is required.")
    .min(3, "Username must be at least 3 characters.")
    .max(30, "Username must be at most 30 characters.")
    .matches(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores."
    ),

  /**
   * Email - required, must be a valid email format.
   */
  email: Yup.string()
    .trim()
    .required("Email is required.")
    .email("Please enter a valid email address."),

  /**
   * Password - required, minimum 6 characters with at least one letter
   * and one number for basic strength requirements.
   */
  password: Yup.string()
    .required("Password is required.")
    .min(6, "Password must be at least 6 characters.")
    .matches(
      /^(?=.*[A-Za-z])(?=.*\d)/,
      "Password must contain at least one letter and one number."
    ),

  /**
   * Confirm password - must match the password field exactly.
   */
  confirmPassword: Yup.string()
    .required("Please confirm your password.")
    .oneOf([Yup.ref("password")], "Passwords do not match."),
});

/* ---------------------------------------------------------------------------
 * CODE SUBMISSION SCHEMA
 *
 * Validates the data required to create a new code submission.
 * The code content field has a generous max length to accommodate
 * larger code blocks.
 * ------------------------------------------------------------------------- */
export const codeSubmissionSchema = Yup.object().shape({
  /**
   * Title - required, concise but descriptive (5-100 characters).
   */
  title: Yup.string()
    .trim()
    .required("Title is required.")
    .min(5, "Title must be at least 5 characters.")
    .max(100, "Title must be at most 100 characters."),

  /**
   * Code content - required, the actual source code to be reviewed.
   */
  codeContent: Yup.string()
    .required("Code content is required.")
    .min(10, "Code must be at least 10 characters long.")
    .max(50000, "Code must be at most 50,000 characters."),

  /**
   * Programming language - required, selected from a predefined list.
   */
  language: Yup.string()
    .trim()
    .required("Programming language is required."),

  /**
   * Description - optional, additional context about the submission.
   */
  description: Yup.string()
    .trim()
    .max(500, "Description must be at most 500 characters."),
});

/* ---------------------------------------------------------------------------
 * REVIEW SCHEMA
 *
 * Validates the data for creating or editing a peer review.
 * The quality score is constrained to a 1-10 scale.
 * ------------------------------------------------------------------------- */
export const reviewSchema = Yup.object().shape({
  /**
   * Submission ID - required, links the review to a specific submission.
   */
  submissionId: Yup.number()
    .required("Submission ID is required.")
    .positive("Submission ID must be a positive number.")
    .integer("Submission ID must be an integer."),

  /**
   * Quality score - required, integer between 1 and 10 inclusive.
   */
  qualityScore: Yup.number()
    .required("Quality score is required.")
    .min(1, "Score must be at least 1.")
    .max(10, "Score must be at most 10.")
    .integer("Score must be a whole number."),

  /**
   * Comments - required, the reviewer's written feedback.
   */
  comments: Yup.string()
    .trim()
    .required("Review comments are required.")
    .min(10, "Comments must be at least 10 characters.")
    .max(5000, "Comments must be at most 5,000 characters."),
});

/* ---------------------------------------------------------------------------
 * REVIEW DIMENSION SCHEMA
 *
 * Validates the data for creating or editing a review dimension
 * (e.g., readability, security, performance).
 * ------------------------------------------------------------------------- */
export const reviewDimensionSchema = Yup.object().shape({
  /**
   * Name - required, short descriptive label for the dimension.
   */
  name: Yup.string()
    .trim()
    .required("Dimension name is required.")
    .min(2, "Name must be at least 2 characters.")
    .max(50, "Name must be at most 50 characters."),

  /**
   * Description - required, explains what this dimension measures.
   */
  description: Yup.string()
    .trim()
    .required("Description is required.")
    .min(10, "Description must be at least 10 characters.")
    .max(300, "Description must be at most 300 characters."),

  /**
   * Weight - optional, numeric weighting factor for score calculation.
   * Defaults to 1.0 if not provided.
   */
  weight: Yup.number()
    .min(0.1, "Weight must be at least 0.1.")
    .max(10, "Weight must be at most 10.")
    .default(1.0),
});
