/**
 * ProtectedRoute.jsx - Route Guard Component
 *
 * Wraps protected routes and ensures only authenticated users can access
 * them. If the user does not have a valid token (i.e., is not logged in),
 * they are automatically redirected to the /login page.
 *
 * The current location is preserved in router state so that after logging
 * in the user can optionally be redirected back to the page they originally
 * requested.
 *
 * Usage in route definitions:
 *   <Route path="/dashboard" element={
 *     <ProtectedRoute><Dashboard /></ProtectedRoute>
 *   } />
 *
 * Dependencies:
 * - react-router-dom: Navigate component for declarative redirects
 * - AuthContext: provides isAuthenticated flag and loading state
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * ProtectedRoute - Guards child components behind authentication.
 *
 * Renders children if the user is authenticated. Otherwise redirects
 * to the login page, preserving the intended destination in location state
 * so the login flow can redirect back after authentication.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - The protected page component(s)
 * @returns {JSX.Element} Either the children or a Navigate redirect
 */
function ProtectedRoute({ children }) {
  /* Retrieve authentication state from context */
  const { isAuthenticated, loading } = useAuth();

  /* Get the current location so we can pass it as state to the login redirect */
  const location = useLocation();

  /*
   * While the AuthContext is still initialising (checking localStorage
   * for an existing token), show a loading spinner instead of flashing
   * the login page. This prevents an unnecessary redirect on page refresh.
   */
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <p>Verifying authentication...</p>
      </div>
    );
  }

  /*
   * If the user is not authenticated, redirect to /login.
   * The 'replace' prop prevents the protected URL from being
   * added to the browser history stack, so pressing "back" after
   * login does not land the user on a redirect loop.
   * The 'state' prop preserves the originally requested URL.
   */
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  /* User is authenticated -- render the protected content */
  return children;
}

export default ProtectedRoute;
