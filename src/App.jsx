/**
 * App.jsx - Main Application Component
 *
 * Defines the top-level routing structure for the Decentralised Peer Code Review Platform.
 * All authenticated routes are wrapped with a ProtectedRoute component that
 * redirects unauthenticated users to the login page.
 *
 * Route structure:
 * - Public: /login, /register
 * - Protected: /dashboard, /submissions, /reviews, /dimensions, /leaderboard, /forecast
 */

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

/* ---------------------------------------------------------------------------
 * Lazy-loaded page components
 * Using React.lazy for code-splitting so that each page bundle is loaded
 * only when the user navigates to the corresponding route.
 * ------------------------------------------------------------------------- */
const Login = React.lazy(() => import("./pages/Login"));
const Register = React.lazy(() => import("./pages/Register"));
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const SubmissionList = React.lazy(() => import("./pages/SubmissionList"));
const SubmissionForm = React.lazy(() => import("./pages/SubmissionForm"));
const SubmissionDetail = React.lazy(() => import("./pages/SubmissionDetail"));
const ReviewList = React.lazy(() => import("./pages/ReviewList"));
const ReviewForm = React.lazy(() => import("./pages/ReviewForm"));
const DimensionList = React.lazy(() => import("./pages/DimensionList"));
const Leaderboard = React.lazy(() => import("./pages/Leaderboard"));
const Forecast = React.lazy(() => import("./pages/Forecast"));

/**
 * ProtectedRoute - Higher-order wrapper that guards routes requiring authentication.
 *
 * If the user is not authenticated (no valid token in context), they are
 * redirected to the /login page. The current location is preserved in
 * router state so the user can be sent back after logging in.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - The child component to render when authenticated
 * @returns {React.ReactNode} The children or a redirect to /login
 */
function ProtectedRoute({ children }) {
  const { token } = useAuth();

  /* If no token exists the user is not authenticated -- redirect to login */
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

/**
 * App - Root component that defines all application routes.
 *
 * React.Suspense is used to show a loading indicator while lazy-loaded
 * page components are being fetched over the network.
 */
function App() {
  return (
    <React.Suspense
      fallback={
        <div className="loading-container">
          <div className="loading-spinner" />
          <p>Loading...</p>
        </div>
      }
    >
      <Routes>
        {/* ---- Public Routes ---- */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ---- Protected Routes ---- */}
        {/* Dashboard - main landing page after login */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Code Submissions - list, create, and detail views */}
        <Route
          path="/submissions"
          element={
            <ProtectedRoute>
              <SubmissionList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/submissions/new"
          element={
            <ProtectedRoute>
              <SubmissionForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/submissions/:id"
          element={
            <ProtectedRoute>
              <SubmissionDetail />
            </ProtectedRoute>
          }
        />

        {/* Reviews - list and create views */}
        <Route
          path="/reviews"
          element={
            <ProtectedRoute>
              <ReviewList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reviews/new"
          element={
            <ProtectedRoute>
              <ReviewForm />
            </ProtectedRoute>
          }
        />

        {/* Review Dimensions management */}
        <Route
          path="/dimensions"
          element={
            <ProtectedRoute>
              <DimensionList />
            </ProtectedRoute>
          }
        />

        {/* Leaderboard showing reputation scores */}
        <Route
          path="/leaderboard"
          element={
            <ProtectedRoute>
              <Leaderboard />
            </ProtectedRoute>
          }
        />

        {/* Forecast / ML prediction page */}
        <Route
          path="/forecast"
          element={
            <ProtectedRoute>
              <Forecast />
            </ProtectedRoute>
          }
        />

        {/* Default redirect: send unknown paths to the dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </React.Suspense>
  );
}

export default App;
