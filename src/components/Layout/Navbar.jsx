/**
 * Navbar.jsx - Top Navigation Bar Component
 *
 * Renders the fixed horizontal navigation bar at the top of the application.
 * Displays the platform branding/title on the left and user information
 * with a logout button on the right.
 *
 * This component is always visible when the user is authenticated and is
 * rendered as part of the MainLayout component.
 *
 * Dependencies:
 * - AuthContext: provides user info and logout method
 * - react-icons: icon for the logout button
 */

import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { FiLogOut, FiUser } from 'react-icons/fi';

/**
 * Navbar - Top navigation bar with branding and user controls.
 *
 * Displays:
 * - Application title/brand on the left side
 * - Current user's username and role on the right
 * - Logout button that clears the session
 *
 * @returns {JSX.Element} The navbar UI
 */
function Navbar() {
  /* Access user info and logout from AuthContext */
  const { user, logout } = useAuth();

  /**
   * handleLogout - Invokes the AuthContext logout function.
   *
   * This clears the JWT from localStorage, resets the auth state,
   * and shows a toast notification. The user will be redirected to
   * /login by the ProtectedRoute guard.
   */
  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="navbar">
      {/* Left side: Application brand / title */}
      <div className="navbar-brand">
        <span>Peer Code Review</span> Platform
      </div>

      {/* Right side: User info and logout action */}
      <div className="navbar-actions">
        {/* Display current user information if available */}
        {user && (
          <div className="navbar-user">
            <FiUser style={{ marginRight: '6px', verticalAlign: 'middle' }} />
            <span>
              {user.username || user.sub || 'User'}
              {/* Show the user role if available */}
              {user.role && (
                <span style={{ marginLeft: '8px', opacity: 0.7 }}>
                  ({user.role})
                </span>
              )}
            </span>
          </div>
        )}

        {/* Logout button */}
        <button
          className="btn btn-secondary btn-sm"
          onClick={handleLogout}
          title="Sign out of your account"
        >
          <FiLogOut />
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
