/**
 * LoginForm.jsx - Login Form Component
 *
 * Renders a login form with username and password fields, validated using
 * react-hook-form and yup. On successful validation the credentials are
 * passed to the AuthContext login function which handles the API call and
 * JWT storage.
 *
 * Route: /login
 *
 * Dependencies:
 * - react-hook-form: declarative form state management
 * - yup + @hookform/resolvers: schema-based validation
 * - AuthContext: provides the login() method and isAuthenticated flag
 * - react-router-dom: navigation after successful login
 */

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/* ---------------------------------------------------------------------------
 * Validation Schema
 * Defines the constraints for each form field. Yup provides a fluent API
 * for building schemas that integrate seamlessly with react-hook-form.
 * ------------------------------------------------------------------------- */
const loginSchema = yup.object().shape({
  /** Username is required and must be at least 3 characters long */
  username: yup
    .string()
    .required('Username is required')
    .min(3, 'Username must be at least 3 characters'),

  /** Password is required and must be at least 6 characters long */
  password: yup
    .string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

/**
 * LoginForm - Renders the login page with form validation and submission.
 *
 * If the user is already authenticated they are redirected to the dashboard.
 * Otherwise the form is presented, and upon valid submission the login()
 * function from AuthContext is invoked.
 *
 * @returns {JSX.Element} The login form UI
 */
function LoginForm() {
  /* Access authentication methods and state from context */
  const { login, isAuthenticated } = useAuth();

  /* React Router hook for programmatic navigation */
  const navigate = useNavigate();

  /* Local state to track whether a login request is in progress */
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* Initialise react-hook-form with yup validation resolver */
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  /* If the user is already logged in, redirect to dashboard immediately */
  if (isAuthenticated) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  /**
   * onSubmit - Handle form submission after validation passes.
   *
   * Calls the AuthContext login method with the form data. If the login
   * succeeds the user is navigated to the dashboard; otherwise the error
   * is handled by the AuthContext (toast notification).
   *
   * @param {Object} data - Validated form data { username, password }
   */
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const success = await login({
        username: data.username,
        password: data.password,
      });

      if (success) {
        /* Navigate to dashboard on successful authentication */
        navigate('/dashboard', { replace: true });
      }
    } finally {
      /* Always reset the submitting state regardless of outcome */
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Form heading */}
        <h2>Sign In</h2>

        {/* Login form - onSubmit is wrapped by handleSubmit for validation */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Username field */}
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              className={`form-control ${errors.username ? 'error' : ''}`}
              placeholder="Enter your username"
              autoComplete="username"
              {...register('username')}
            />
            {/* Display validation error for username if present */}
            {errors.username && (
              <p className="form-error">{errors.username.message}</p>
            )}
          </div>

          {/* Password field */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className={`form-control ${errors.password ? 'error' : ''}`}
              placeholder="Enter your password"
              autoComplete="current-password"
              {...register('password')}
            />
            {/* Display validation error for password if present */}
            {errors.password && (
              <p className="form-error">{errors.password.message}</p>
            )}
          </div>

          {/* Submit button - disabled while request is in flight */}
          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Footer link to registration page */}
        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/register">Create one here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;
