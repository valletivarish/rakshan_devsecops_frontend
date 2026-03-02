/**
 * RegisterForm.jsx - Registration Form Component
 *
 * Renders a registration form with username, email, and password fields.
 * Uses react-hook-form for form state management and yup for schema-based
 * validation. On successful validation the data is sent to the AuthContext
 * register function which handles the API call.
 *
 * Route: /register
 *
 * Dependencies:
 * - react-hook-form: declarative form state management
 * - yup + @hookform/resolvers: schema-based validation
 * - AuthContext: provides the register() method and isAuthenticated flag
 * - react-router-dom: navigation after successful registration
 */

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/* ---------------------------------------------------------------------------
 * Validation Schema
 * Enforces constraints on all registration fields. The confirm password
 * field uses yup's oneOf() to ensure it matches the password field.
 * ------------------------------------------------------------------------- */
const registerSchema = yup.object().shape({
  /** Username must be between 3 and 30 characters */
  username: yup
    .string()
    .required('Username is required')
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must not exceed 30 characters'),

  /** Email must be a valid email format */
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address'),

  /** Password must be at least 6 characters */
  password: yup
    .string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters'),

  /** Confirm password must match the password field exactly */
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords do not match'),
});

/**
 * RegisterForm - Renders the user registration page with validated form.
 *
 * If the user is already authenticated they are redirected to the dashboard.
 * Upon valid submission the register() function from AuthContext is called
 * which may auto-login the user depending on the backend response.
 *
 * @returns {JSX.Element} The registration form UI
 */
function RegisterForm() {
  /* Access authentication methods and state from context */
  const { register: registerUser, isAuthenticated } = useAuth();

  /* React Router hook for programmatic navigation */
  const navigate = useNavigate();

  /* Local state to track whether the registration request is in progress */
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* Initialise react-hook-form with yup validation resolver */
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  /* Redirect already-authenticated users to the dashboard */
  if (isAuthenticated) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  /**
   * onSubmit - Handle form submission after validation passes.
   *
   * Sends the registration data (excluding confirmPassword) to the
   * AuthContext register function. On success, navigates to login page
   * or dashboard depending on whether auto-login is supported.
   *
   * @param {Object} data - Validated form data { username, email, password, confirmPassword }
   */
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const success = await registerUser({
        username: data.username,
        email: data.email,
        password: data.password,
      });

      if (success) {
        /* Navigate to login page so the user can sign in with new credentials */
        navigate('/login', { replace: true });
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
        <h2>Create Account</h2>

        {/* Registration form - onSubmit wrapped by handleSubmit for validation */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Username field */}
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              className={`form-control ${errors.username ? 'error' : ''}`}
              placeholder="Choose a username"
              autoComplete="username"
              {...register('username')}
            />
            {errors.username && (
              <p className="form-error">{errors.username.message}</p>
            )}
          </div>

          {/* Email field */}
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              className={`form-control ${errors.email ? 'error' : ''}`}
              placeholder="Enter your email"
              autoComplete="email"
              {...register('email')}
            />
            {errors.email && (
              <p className="form-error">{errors.email.message}</p>
            )}
          </div>

          {/* Password field */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className={`form-control ${errors.password ? 'error' : ''}`}
              placeholder="Create a password"
              autoComplete="new-password"
              {...register('password')}
            />
            {errors.password && (
              <p className="form-error">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm password field */}
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              className={`form-control ${errors.confirmPassword ? 'error' : ''}`}
              placeholder="Confirm your password"
              autoComplete="new-password"
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <p className="form-error">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Submit button - disabled while request is in flight */}
          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        {/* Footer link to login page */}
        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login">Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterForm;
