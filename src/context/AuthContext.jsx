/**
 * AuthContext.jsx - Authentication Context Provider
 *
 * Manages global authentication state for the application including:
 * - JWT token storage and retrieval from localStorage
 * - User information decoded from the token
 * - Login, register, and logout operations
 *
 * Any component in the tree can access auth state via the useAuth() hook.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import authService from "../services/authService";

/**
 * Key used to persist the JWT token in the browser's localStorage.
 * Changing this value will effectively log out all existing sessions.
 */
const TOKEN_STORAGE_KEY = "pcr_auth_token";

/**
 * Key used to persist basic user information in localStorage so it
 * survives page refreshes without requiring a network call.
 */
const USER_STORAGE_KEY = "pcr_auth_user";

/**
 * Create the React context object. Components consuming this context
 * will re-render whenever the provided value changes.
 */
const AuthContext = createContext(null);

/**
 * parseJwtPayload - Decode the payload section of a JWT without verification.
 *
 * This is used client-side only to extract claims such as the username
 * and expiration time. Actual token verification happens on the server.
 *
 * @param {string} token - The raw JWT string
 * @returns {Object|null} The decoded payload or null if parsing fails
 */
function parseJwtPayload(token) {
  try {
    /* JWT structure: header.payload.signature -- we need the payload (index 1) */
    const base64Payload = token.split(".")[1];

    /* Convert base64url to standard base64 and decode */
    const jsonPayload = atob(base64Payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(jsonPayload);
  } catch (error) {
    /* If the token is malformed we return null rather than crashing */
    console.error("Failed to parse JWT payload:", error);
    return null;
  }
}

/**
 * isTokenExpired - Check whether a JWT has expired based on the `exp` claim.
 *
 * @param {string} token - The raw JWT string
 * @returns {boolean} True if the token is expired or unparsable
 */
function isTokenExpired(token) {
  const payload = parseJwtPayload(token);
  if (!payload || !payload.exp) {
    return true;
  }
  /* exp is in seconds; Date.now() returns milliseconds */
  return Date.now() >= payload.exp * 1000;
}

/**
 * AuthProvider - Wraps the application and provides authentication state.
 *
 * On mount it checks localStorage for an existing token and validates
 * that it has not expired. If valid, the user is automatically signed in.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components that can consume auth state
 */
export function AuthProvider({ children }) {
  /* -----------------------------------------------------------------------
   * State
   * --------------------------------------------------------------------- */
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while checking localStorage

  /* -----------------------------------------------------------------------
   * Initialise state from localStorage on first render
   * --------------------------------------------------------------------- */
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);

    if (storedToken && !isTokenExpired(storedToken)) {
      /* Token exists and is still valid -- restore session */
      setToken(storedToken);
      setUser(storedUser ? JSON.parse(storedUser) : parseJwtPayload(storedToken));
    } else if (storedToken) {
      /* Token exists but has expired -- clean up */
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
    }

    /* Mark initialisation as complete */
    setLoading(false);
  }, []);

  /* -----------------------------------------------------------------------
   * login - Authenticate a user and store the returned JWT.
   *
   * @param {Object} credentials - { username, password }
   * @returns {boolean} True if login succeeded
   * --------------------------------------------------------------------- */
  const login = useCallback(async (credentials) => {
    try {
      const response = await authService.login(credentials);

      /* The backend may return the token in different shapes; handle common patterns */
      const receivedToken = response.data.token || response.data.jwt || response.data.accessToken;
      const receivedUser = response.data.user || parseJwtPayload(receivedToken);

      if (!receivedToken) {
        toast.error("Login failed: no token received from the server.");
        return false;
      }

      /* Persist token and user information */
      localStorage.setItem(TOKEN_STORAGE_KEY, receivedToken);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(receivedUser));

      setToken(receivedToken);
      setUser(receivedUser);

      toast.success("Logged in successfully.");
      return true;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Login failed. Please check your credentials.";
      toast.error(message);
      return false;
    }
  }, []);

  /* -----------------------------------------------------------------------
   * register - Create a new user account and optionally log them in.
   *
   * @param {Object} userData - { username, email, password }
   * @returns {boolean} True if registration succeeded
   * --------------------------------------------------------------------- */
  const register = useCallback(async (userData) => {
    try {
      const response = await authService.register(userData);

      /* Some APIs return a token on registration; if so, auto-login */
      const receivedToken = response.data.token || response.data.jwt || response.data.accessToken;

      if (receivedToken) {
        const receivedUser = response.data.user || parseJwtPayload(receivedToken);
        localStorage.setItem(TOKEN_STORAGE_KEY, receivedToken);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(receivedUser));
        setToken(receivedToken);
        setUser(receivedUser);
      }

      toast.success("Registration successful.");
      return true;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Registration failed. Please try again.";
      toast.error(message);
      return false;
    }
  }, []);

  /* -----------------------------------------------------------------------
   * logout - Clear all authentication state and storage.
   * --------------------------------------------------------------------- */
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    setToken(null);
    setUser(null);
    toast.info("You have been logged out.");
  }, []);

  /* -----------------------------------------------------------------------
   * Context value exposed to consuming components.
   * Memoisation is handled by React's context diffing; the object
   * reference will only change when one of the dependencies changes.
   * --------------------------------------------------------------------- */
  const contextValue = {
    token,
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!token,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {/* Do not render children until the initial token check completes */}
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner" />
          <p>Initialising session...</p>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

/**
 * useAuth - Custom hook for consuming the AuthContext.
 *
 * Throws an error if used outside of an AuthProvider so that
 * misuse is caught early during development.
 *
 * @returns {Object} The authentication context value
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider. Wrap your component tree with <AuthProvider>.");
  }
  return context;
}

export default AuthContext;
