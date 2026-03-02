/**
 * authService.js - Authentication API Service
 *
 * Provides functions for user authentication operations:
 * - login:    Authenticate an existing user and receive a JWT
 * - register: Create a new user account
 *
 * All requests are routed through the shared Axios instance (api.js)
 * which handles base URL configuration and token management.
 */

import api from "./api";

/**
 * Base path for authentication endpoints on the Spring Boot backend.
 */
const AUTH_BASE = "/auth";

/**
 * authService - Encapsulates all authentication-related API calls.
 */
const authService = {
  /**
   * login - Authenticate a user with their credentials.
   *
   * Sends a POST request to /api/auth/login with the provided
   * username/email and password. On success the backend returns
   * a JWT token that should be stored for subsequent requests.
   *
   * @param {Object} data - Login credentials
   * @param {string} data.username - The user's username or email
   * @param {string} data.password - The user's password
   * @returns {Promise<import('axios').AxiosResponse>} Response containing the JWT token
   */
  login(data) {
    return api.post(`${AUTH_BASE}/login`, data);
  },

  /**
   * register - Create a new user account.
   *
   * Sends a POST request to /api/auth/register with the user's
   * registration details. Depending on the backend configuration,
   * the response may include a JWT for automatic login or require
   * the user to log in separately.
   *
   * @param {Object} data - Registration details
   * @param {string} data.username - Desired username
   * @param {string} data.email    - User's email address
   * @param {string} data.password - Chosen password
   * @returns {Promise<import('axios').AxiosResponse>} Response with registration result
   */
  register(data) {
    return api.post(`${AUTH_BASE}/register`, data);
  },
};

export default authService;
