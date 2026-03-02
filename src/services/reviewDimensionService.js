/**
 * reviewDimensionService.js - Review Dimension API Service
 *
 * Manages review dimensions, which represent the criteria or categories
 * by which code is evaluated during a peer review (e.g., readability,
 * performance, security, maintainability).
 *
 * These dimensions are configurable and allow the platform to support
 * customisable review rubrics.
 *
 * Available operations:
 * - CRUD operations (getAll, getById, create, update, delete)
 */

import api from "./api";

/**
 * Base path for dimension endpoints on the Spring Boot backend.
 */
const DIMENSIONS_BASE = "/dimensions";

/**
 * reviewDimensionService - Encapsulates all review-dimension-related API calls.
 */
const reviewDimensionService = {
  /**
   * getAll - Retrieve all review dimensions.
   *
   * Returns the complete list of configured review dimensions
   * that reviewers can use when evaluating code.
   *
   * @returns {Promise<import('axios').AxiosResponse>} List of dimension objects
   */
  getAll() {
    return api.get(DIMENSIONS_BASE);
  },

  /**
   * getById - Retrieve a single review dimension by its ID.
   *
   * @param {number|string} id - The unique identifier of the dimension
   * @returns {Promise<import('axios').AxiosResponse>} The dimension object
   */
  getById(id) {
    return api.get(`${DIMENSIONS_BASE}/${id}`);
  },

  /**
   * create - Add a new review dimension.
   *
   * Creates a new criterion that will be available for reviewers
   * to use when scoring submissions.
   *
   * @param {Object} data - Dimension payload
   * @param {string} data.name        - Name of the dimension (e.g., "Security")
   * @param {string} data.description - Explanation of what this dimension measures
   * @param {number} [data.weight]    - Optional weighting factor for score calculation
   * @returns {Promise<import('axios').AxiosResponse>} The newly created dimension
   */
  create(data) {
    return api.post(DIMENSIONS_BASE, data);
  },

  /**
   * update - Modify an existing review dimension.
   *
   * @param {number|string} id - The dimension ID
   * @param {Object} data      - Updated dimension fields
   * @returns {Promise<import('axios').AxiosResponse>} The updated dimension object
   */
  update(id, data) {
    return api.put(`${DIMENSIONS_BASE}/${id}`, data);
  },

  /**
   * delete - Remove a review dimension.
   *
   * Caution: deleting a dimension may affect historical review
   * data that references it. The backend should handle cascading
   * or soft-deletion appropriately.
   *
   * @param {number|string} id - The dimension ID to delete
   * @returns {Promise<import('axios').AxiosResponse>} Confirmation of deletion
   */
  delete(id) {
    return api.delete(`${DIMENSIONS_BASE}/${id}`);
  },
};

export default reviewDimensionService;
