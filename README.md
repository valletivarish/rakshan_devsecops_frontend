# Decentralised Peer Code Review Platform - Frontend

React 18 frontend for the Decentralised Peer Code Review Platform.

## Project Overview

This frontend provides a complete user interface for a platform where developers submit code snippets for anonymous peer review. Features include multi-dimensional code quality scoring, a reviewer leaderboard, dashboard with analytics charts, and ML-based review quality predictions.

## Tech Stack

- React 18 with Vite build tool
- React Router v6 for client-side routing
- Axios with JWT interceptor for API communication
- Recharts for data visualization (bar charts, pie charts)
- React Hook Form with Yup validation for forms
- React Toastify for notifications
- React Icons for UI icons
- ESLint for static code analysis

## Pages

- /login - User authentication
- /register - New user registration
- /dashboard - Platform overview with statistics and charts
- /submissions - Code submission list with filtering
- /submissions/new - Create new code submission
- /submissions/:id - View submission detail with code and reviews
- /reviews - List all peer reviews
- /reviews/new - Write a new review with dimension ratings
- /dimensions - Manage review dimensions (criteria)
- /leaderboard - Reviewer reputation rankings
- /forecast - ML-based review quality predictions

## Running Locally

### Prerequisites
- Node.js 18+
- npm 9+

### Setup

```bash
npm install
npm run dev
```

The application runs at http://localhost:5173 and proxies API requests to http://localhost:8080.

## Building for Production

```bash
npm run build
```

Output is generated in the dist/ directory.

## Linting

```bash
npm run lint
```

ESLint is configured with React hooks rules and security checks.

## CI/CD Pipeline

GitHub Actions workflow (.github/workflows/ci-cd.yml) includes:

CI stages: Install dependencies, ESLint analysis, production build, npm audit
CD stages: Deploy dist/ to AWS S3 static website hosting, smoke test

## Infrastructure

Terraform configuration (terraform/) provisions:
- AWS VPC with subnets
- EC2 instance for backend
- RDS PostgreSQL database
- S3 bucket with static website hosting

## Student Information

- Student: Rakshan
- Student ID: 25180754
- Module: Cloud DevOpsSec (H9CDOS)
- Project: Decentralised Peer Code Review Platform
