/**
 * codeSubmissionService.js - Code Submission API Service
 *
 * Handles all API interactions related to code submissions, which are
 * the core entities in the peer review workflow. Each submission
 * represents a piece of code that has been uploaded for peer review.
 *
 * Available operations:
 * - CRUD operations (getAll, getById, create, update, delete)
 * - Assign a reviewer to a submission
 * - Filter submissions by status or programming language
 */

import api from "./api";

/**
 * Base path for submission endpoints on the Spring Boot backend.
 */
const SUBMISSIONS_BASE = "/submissions";

/**
 * codeSubmissionService - Encapsulates all code-submission-related API calls.
 */
const codeSubmissionService = {
  /**
   * getAll - Retrieve all code submissions.
   *
   * Fetches the complete list of submissions. The backend may support
   * pagination via query parameters in future iterations.
   *
   * @returns {Promise<import('axios').AxiosResponse>} List of code submissions
   */
  getAll() {
    return api.get(SUBMISSIONS_BASE);
  },

  /**
   * getById - Retrieve a single code submission by its ID.
   *
   * @param {number|string} id - The unique identifier of the submission
   * @returns {Promise<import('axios').AxiosResponse>} The submission object
   */
  getById(id) {
    return api.get(`${SUBMISSIONS_BASE}/${id}`);
  },

  /**
   * create - Submit a new piece of code for review.
   *
   * @param {Object} data - Submission payload
   * @param {string} data.title       - A descriptive title for the submission
   * @param {string} data.codeContent - The actual source code
   * @param {string} data.language    - The programming language (e.g., "Java", "Python")
   * @param {string} [data.description] - Optional description or context
   * @returns {Promise<import('axios').AxiosResponse>} The newly created submission
   */
  create(data) {
    return api.post(SUBMISSIONS_BASE, data);
  },

  /**
   * update - Modify an existing code submission.
   *
   * Typically used to update the code content, title, or description
   * before a review has been completed.
   *
   * @param {number|string} id - The submission ID
   * @param {Object} data      - Updated fields
   * @returns {Promise<import('axios').AxiosResponse>} The updated submission
   */
  update(id, data) {
    return api.put(`${SUBMISSIONS_BASE}/${id}`, data);
  },

  /**
   * delete - Remove a code submission.
   *
   * This is a destructive action. The backend should enforce
   * authorisation rules (e.g., only the author can delete).
   *
   * @param {number|string} id - The submission ID to delete
   * @returns {Promise<import('axios').AxiosResponse>} Confirmation of deletion
   */
  delete(id) {
    return api.delete(`${SUBMISSIONS_BASE}/${id}`);
  },

  /**
   * assignReviewer - Assign a reviewer to a specific submission.
   *
   * Transitions the submission into a "pending review" state and
   * notifies the assigned reviewer.
   *
   * @param {number|string} id           - The submission ID
   * @param {Object}        reviewerData - Reviewer assignment payload
   * @param {number|string} reviewerData.reviewerId - The ID of the user to assign
   * @returns {Promise<import('axios').AxiosResponse>} Updated submission with reviewer info
   */
  assignReviewer(id, reviewerData) {
    return api.post(`${SUBMISSIONS_BASE}/${id}/assign-reviewer`, reviewerData);
  },

  /**
   * getByStatus - Retrieve submissions filtered by their review status.
   *
   * Common statuses might include: PENDING, IN_REVIEW, REVIEWED, REJECTED.
   *
   * @param {string} status - The status to filter by
   * @returns {Promise<import('axios').AxiosResponse>} Filtered list of submissions
   */
  getByStatus(status) {
    return api.get(`${SUBMISSIONS_BASE}/status/${status}`);
  },

  /**
   * getByLanguage - Retrieve submissions filtered by programming language.
   *
   * @param {string} language - The programming language to filter by (e.g., "Java")
   * @returns {Promise<import('axios').AxiosResponse>} Filtered list of submissions
   */
  getByLanguage(language) {
    return api.get(`${SUBMISSIONS_BASE}/language/${language}`);
  },
};

export default codeSubmissionService;
