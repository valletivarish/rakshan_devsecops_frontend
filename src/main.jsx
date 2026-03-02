/**
 * main.jsx - Application Entry Point
 *
 * This is the root entry file for the Decentralised Peer Code Review Platform.
 * It initializes the React application with:
 * - BrowserRouter for client-side routing
 * - AuthProvider for global authentication state
 * - ToastContainer for application-wide notifications
 *
 * React 18 createRoot API is used for concurrent rendering support.
 */

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";
import "./App.css";

/**
 * Get the root DOM element where the React application will be mounted.
 * This element is defined in the public/index.html file.
 */
const rootElement = document.getElementById("root");

/**
 * Create the React 18 root using the concurrent rendering API.
 * This enables features like automatic batching and transitions.
 */
const root = ReactDOM.createRoot(rootElement);

/**
 * Render the application wrapped in necessary providers:
 * - React.StrictMode: Enables additional development checks and warnings
 * - BrowserRouter: Provides routing context using the HTML5 History API
 * - AuthProvider: Makes authentication state available throughout the component tree
 * - ToastContainer: Renders toast notifications at the application level
 */
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        {/* Toast notification container positioned at the top-right corner */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
