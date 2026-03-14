import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import MainLayout from "./components/Layout/MainLayout";

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

function ProtectedRoute({ children }) {
  const { token } = useAuth();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  return (
    <React.Suspense
      fallback={
        <div className="loading-container">
          <div className="loading-spinner" />
          <p>Loading...</p> // Updated for CI/CD demonstration
        </div>
      }
    >
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes wrapped with MainLayout */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/submissions" element={<SubmissionList />} />
          <Route path="/submissions/new" element={<SubmissionForm />} />
          <Route path="/submissions/:id" element={<SubmissionDetail />} />
          <Route path="/reviews" element={<ReviewList />} />
          <Route path="/reviews/new" element={<ReviewForm />} />
          <Route path="/dimensions" element={<DimensionList />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/forecast" element={<Forecast />} />
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </React.Suspense>
  );
}

export default App;
