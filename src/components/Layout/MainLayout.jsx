/**
 * MainLayout.jsx - Application Shell Layout Component
 *
 * Provides the top-level layout structure for all authenticated pages.
 * Combines the Navbar (top), Sidebar (left), and a main content area
 * where child routes are rendered via react-router-dom's Outlet.
 *
 * The layout uses a CSS Grid defined in App.css with the grid areas:
 * - "navbar"  spanning the full width at the top
 * - "sidebar" on the left below the navbar
 * - "main"    on the right below the navbar (scrollable content area)
 *
 * This component is typically used as the element for a parent route
 * that wraps all authenticated child routes:
 *
 *   <Route element={<MainLayout />}>
 *     <Route path="/dashboard" element={<Dashboard />} />
 *     ...
 *   </Route>
 *
 * Dependencies:
 * - react-router-dom: Outlet component for rendering nested routes
 * - Navbar: top navigation bar component
 * - Sidebar: left sidebar navigation component
 */

import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

/**
 * MainLayout - Renders the application shell with navbar, sidebar, and content area.
 *
 * The Outlet component acts as a placeholder where the matched child
 * route's element will be rendered. This pattern allows all authenticated
 * pages to share the same navigation chrome without re-mounting it on
 * every route change.
 *
 * @returns {JSX.Element} The full application layout
 */
function MainLayout() {
  return (
    <div className="app-layout">
      {/* Fixed top navigation bar spanning full width */}
      <Navbar />

      {/* Left sidebar with navigation links */}
      <Sidebar />

      {/* Main content area where child route components render */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;
