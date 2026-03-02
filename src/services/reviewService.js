/**
 * reviewService.js - Review API Service
 *
 * Manages all API interactions related to peer code reviews.
 * A review is created by a reviewer in response to a code submission
 * and contains feedback, scores, and improvement suggestions.
 *
 * Available operations:
 * - CRUD operations (getAll, getById, create, update, delete)
 * - Filter reviews by reviewer or by submission
 */

import api from "./api";

/**
 * Base path for review endpoints on the Spring Boot backend.
 */
const REVIEWS_BASE = "/reviews";

/**
 * reviewService - Encapsulates all review-related API calls.
 */
const reviewService = {
  /**
   * getAll - Retrieve all reviews.
   *
   * Returns the complete list of reviews across all submissions.
   *
   * @returns {Promise<import('axios').AxiosResponse>} List of review objects
   */
  getAll() {
    return api.get(REVIEWS_BASE);
  },

  /**
   * getById - Retrieve a single review by its ID.
   *
   * @param {number|string} id - The unique identifier of the review
   * @returns {Promise<import('axios').AxiosResponse>} The review object
   */
  getById(id) {
    return api.get(`${REVIEWS_BASE}/${id}`);
  },

  /**
   * create - Submit a new peer review.
   *
   * The review is associated with a specific code submission and
   * contains the reviewer's feedback, quality score, and comments.
   *
   * @param {Object} data - Review payload
   * @param {number|string} data.submissionId - The submission being reviewed
   * @param {number}        data.qualityScore - Numeric quality score
   * @param {string}        data.comments     - Reviewer's written feedback
   * @returns {Promise<import('axios').AxiosResponse>} The newly created review
   */
  create(data) {
    return api.post(REVIEWS_BASE, data);
  },

  /**
   * update - Modify an existing review.
   *
   * Allows a reviewer to update their score or comments after
   * the initial review has been submitted.
   *
   * @param {number|string} id - The review ID
   * @param {Object} data      - Updated review fields
   * @returns {Promise<import('axios').AxiosResponse>} The updated review object
   */
  update(id, data) {
    return api.put(`${REVIEWS_BASE}/${id}`, data);
  },

  /**
   * delete - Remove a review.
   *
   * This action is typically restricted to the review author
   * or an administrator.
   *
   * @param {number|string} id - The review ID to delete
   * @returns {Promise<import('axios').AxiosResponse>} Confirmation of deletion
   */
  delete(id) {
    return api.delete(`${REVIEWS_BASE}/${id}`);
  },

  /**
   * getByReviewer - Retrieve all reviews authored by a specific reviewer.
   *
   * Useful for the "My Reviews" section where a user can see
   * all the reviews they have submitted.
   *
   * @param {number|string} reviewerId - The reviewer's user ID
   * @returns {Promise<import('axios').AxiosResponse>} List of reviews by this reviewer
   */
  getByReviewer(reviewerId) {
    return api.get(`${REVIEWS_BASE}/reviewer/${reviewerId}`);
  },

  /**
   * getBySubmission - Retrieve all reviews for a specific code submission.
   *
   * Used on the submission detail page to show all feedback
   * that has been provided for a particular piece of code.
   *
   * @param {number|string} submissionId - The submission ID
   * @returns {Promise<import('axios').AxiosResponse>} List of reviews for this submission
   */
  getBySubmission(submissionId) {
    return api.get(`${REVIEWS_BASE}/submission/${submissionId}`);
  },
};

export default reviewService;
