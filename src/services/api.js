/**
 * api.js - Axios Instance Configuration
 *
 * Creates and exports a pre-configured Axios instance that all service
 * modules use for HTTP communication with the Spring Boot backend.
 *
 * Features:
 * - Base URL pointing to the backend running on port 8080
 * - Request interceptor that attaches the JWT token from localStorage
 * - Response interceptor that handles common error scenarios (401, 403, 500)
 * - Configurable timeout to prevent hanging requests
 */

import axios from "axios";

/**
 * Base URL for the Spring Boot backend API.
 * In production this should be set via an environment variable
 * (e.g., VITE_API_BASE_URL). The fallback targets the local dev server.
 */
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

/**
 * localStorage key where the JWT token is stored.
 * This must match the key used in AuthContext.jsx.
 */
const TOKEN_KEY = "pcr_auth_token";

/**
 * Create the shared Axios instance with sensible defaults.
 */
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000, // 15 second timeout for all requests
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/* ---------------------------------------------------------------------------
 * REQUEST INTERCEPTOR
 *
 * Before every outgoing request, check localStorage for a JWT token.
 * If one exists, attach it as a Bearer token in the Authorization header
 * so the backend can authenticate the request.
 * ------------------------------------------------------------------------- */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    /* If the request setup itself fails, reject immediately */
    return Promise.reject(error);
  }
);

/* ---------------------------------------------------------------------------
 * RESPONSE INTERCEPTOR
 *
 * Handles common HTTP error responses centrally so that individual service
 * modules do not need to duplicate this logic.
 *
 * - 401 Unauthorized: Token is missing or expired. Clear auth state and
 *   redirect to the login page.
 * - 403 Forbidden: User lacks the required permissions.
 * - 500+ Server errors: Log details for debugging.
 * ------------------------------------------------------------------------- */
api.interceptors.response.use(
  (response) => {
    /* Successful responses (2xx) pass through unchanged */
    return response;
  },
  (error) => {
    if (error.response) {
      const { status } = error.response;

      if (status === 401) {
        /*
         * The token is either expired or invalid.
         * Remove it from storage and redirect to login so the user
         * can re-authenticate.
         */
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem("pcr_auth_user");

        /* Only redirect if we are not already on the login page to avoid loops */
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }

      if (status === 403) {
        console.warn("Access denied: you do not have permission for this action.");
      }

      if (status >= 500) {
        console.error("Server error:", error.response.data);
      }
    } else if (error.request) {
      /* Request was sent but no response received (network error) */
      console.error("Network error: no response received from the server.", error.request);
    } else {
      /* Something went wrong while setting up the request */
      console.error("Request setup error:", error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
