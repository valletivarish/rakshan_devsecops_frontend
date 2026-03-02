/**
 * Sidebar.jsx - Left Sidebar Navigation Component
 *
 * Renders the vertical sidebar containing navigation links to all major
 * sections of the application. Uses react-router-dom's NavLink component
 * to highlight the currently active route.
 *
 * Navigation items are grouped logically:
 * - Overview: Dashboard
 * - Code: Submissions
 * - Reviews: Reviews, Review Dimensions
 * - Analytics: Leaderboard, Forecast
 *
 * Each link includes an icon from react-icons/fi (Feather Icons) for
 * visual clarity and a text label.
 *
 * Dependencies:
 * - react-router-dom: NavLink for active-state-aware navigation
 * - react-icons/fi: Feather icon set for sidebar icons
 */

import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FiGrid,
  FiCode,
  FiMessageSquare,
  FiLayers,
  FiAward,
  FiTrendingUp,
} from 'react-icons/fi';

/**
 * navItems - Configuration array for sidebar navigation links.
 *
 * Each item defines:
 * - path: the route to navigate to
 * - label: the text displayed in the sidebar
 * - icon: the React icon component to render
 * - section: optional section header displayed above the link
 */
const navItems = [
  {
    section: 'Overview',
    path: '/dashboard',
    label: 'Dashboard',
    icon: FiGrid,
  },
  {
    section: 'Code',
    path: '/submissions',
    label: 'Submissions',
    icon: FiCode,
  },
  {
    section: 'Reviews',
    path: '/reviews',
    label: 'Reviews',
    icon: FiMessageSquare,
  },
  {
    path: '/dimensions',
    label: 'Dimensions',
    icon: FiLayers,
  },
  {
    section: 'Analytics',
    path: '/leaderboard',
    label: 'Leaderboard',
    icon: FiAward,
  },
  {
    path: '/forecast',
    label: 'Forecast',
    icon: FiTrendingUp,
  },
];

/**
 * Sidebar - Vertical navigation sidebar with grouped link sections.
 *
 * Iterates over the navItems configuration to render section titles
 * and NavLink components. The NavLink automatically applies the "active"
 * CSS class when the current route matches the link's path.
 *
 * @returns {JSX.Element} The sidebar navigation UI
 */
function Sidebar() {
  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          /* Destructure the icon component for rendering */
          const IconComponent = item.icon;

          return (
            <React.Fragment key={item.path}>
              {/*
               * Render a section title if this item starts a new section.
               * Section titles are uppercase labels that visually group
               * related navigation items together.
               */}
              {item.section && (
                <div className="sidebar-section-title">{item.section}</div>
              )}

              {/*
               * NavLink applies the "active" className when the current
               * route matches the 'to' prop. This is used by the CSS
               * to highlight the active sidebar link with a coloured
               * left border and background.
               */}
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'active' : ''}`
                }
              >
                <IconComponent className="icon" />
                <span>{item.label}</span>
              </NavLink>
            </React.Fragment>
          );
        })}
      </nav>
    </aside>
  );
}

export default Sidebar;
