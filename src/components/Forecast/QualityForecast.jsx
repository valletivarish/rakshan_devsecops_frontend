/**
 * QualityForecast.jsx - ML Quality Prediction Page Component
 *
 * Provides an interface for the platform's machine learning prediction features.
 * This page has two main sections:
 *
 * 1. Quality Score Prediction:
 *    - Input field for code length (in characters or lines)
 *    - Button to trigger prediction
 *    - Displays: predicted quality score, trend direction, confidence level,
 *      and a human-readable explanation of the prediction
 *
 * 2. Score Trend Forecast:
 *    - Input field for the number of future periods to forecast
 *    - Button to trigger the trend forecast
 *    - Displays the forecasted score values for each future period
 *
 * The predictions use trained regression and time-series models on the backend
 * to provide insights into expected code quality based on historical data.
 *
 * Route: /forecast
 *
 * Dependencies:
 * - forecastService: API service for prediction endpoints
 * - react-toastify: error notifications for failed predictions
 * - LoadingSpinner: loading indicator during API calls
 */

import React, { useState } from 'react';
import { toast } from 'react-toastify';
import forecastService from '../../services/forecastService';
import LoadingSpinner from '../common/LoadingSpinner';

/**
 * getTrendIndicator - Returns a text indicator for the trend direction.
 *
 * Converts a trend direction string into a descriptive label that
 * communicates whether the quality is expected to improve or decline.
 *
 * @param {string} direction - The trend direction (e.g., "UP", "DOWN", "STABLE")
 * @returns {string} Human-readable trend description
 */
function getTrendIndicator(direction) {
  if (!direction) return 'Unknown';

  const normalised = direction.toUpperCase();
  switch (normalised) {
    case 'UP':
    case 'INCREASING':
    case 'POSITIVE':
      return 'Improving (Upward)';
    case 'DOWN':
    case 'DECREASING':
    case 'NEGATIVE':
      return 'Declining (Downward)';
    case 'STABLE':
    case 'NEUTRAL':
    case 'FLAT':
      return 'Stable (No significant change)';
    default:
      return direction;
  }
}

/**
 * getTrendBadgeClass - Returns the badge CSS class for a trend direction.
 *
 * @param {string} direction - The trend direction
 * @returns {string} CSS class string for the badge
 */
function getTrendBadgeClass(direction) {
  if (!direction) return 'badge badge-primary';

  const normalised = direction.toUpperCase();
  if (['UP', 'INCREASING', 'POSITIVE'].includes(normalised)) {
    return 'badge badge-success';
  }
  if (['DOWN', 'DECREASING', 'NEGATIVE'].includes(normalised)) {
    return 'badge badge-danger';
  }
  return 'badge badge-warning';
}

/**
 * QualityForecast - Renders the ML prediction page with two sections.
 *
 * Each section operates independently with its own state, loading
 * indicator, and result display area.
 *
 * @returns {JSX.Element} The forecast page UI
 */
function QualityForecast() {
  /* ------ Quality Score Prediction State ------ */
  const [codeLength, setCodeLength] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [predicting, setPredicting] = useState(false);

  /* ------ Trend Forecast State ------ */
  const [periodsAhead, setPeriodsAhead] = useState('');
  const [trendData, setTrendData] = useState(null);
  const [forecasting, setForecasting] = useState(false);

  /* ------ Quality Score Prediction Handler ------ */

  /**
   * handlePredict - Triggers the quality score prediction API call.
   *
   * Validates the code length input, sends it to the backend's
   * prediction endpoint, and displays the returned results.
   */
  const handlePredict = async () => {
    /* Validate input */
    const length = Number(codeLength);
    if (!codeLength || isNaN(length) || length <= 0) {
      toast.error('Please enter a valid code length (positive number).');
      return;
    }

    setPredicting(true);
    setPrediction(null);
    try {
      const response = await forecastService.predictQualityScore(length);
      setPrediction(response.data);
    } catch (err) {
      console.error('Quality prediction failed:', err);
      toast.error(
        err.response?.data?.message || 'Failed to generate quality prediction.'
      );
    } finally {
      setPredicting(false);
    }
  };

  /* ------ Trend Forecast Handler ------ */

  /**
   * handleForecast - Triggers the score trend forecast API call.
   *
   * Validates the periods input, sends it to the backend's trend
   * endpoint, and displays the returned forecast data.
   */
  const handleForecast = async () => {
    /* Validate input */
    const periods = Number(periodsAhead);
    if (!periodsAhead || isNaN(periods) || periods <= 0 || periods > 52) {
      toast.error('Please enter a valid number of periods (1-52).');
      return;
    }

    setForecasting(true);
    setTrendData(null);
    try {
      const response = await forecastService.predictScoreTrend(periods);
      setTrendData(response.data);
    } catch (err) {
      console.error('Trend forecast failed:', err);
      toast.error(
        err.response?.data?.message || 'Failed to generate trend forecast.'
      );
    } finally {
      setForecasting(false);
    }
  };

  return (
    <div>
      {/* Page header */}
      <div className="page-header">
        <h1>Quality Forecast</h1>
      </div>

      {/* ================================================================
       * Section 1: Quality Score Prediction
       * Predicts the expected quality score based on code length input.
       * ================================================================ */}
      <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
        <div className="card-header">
          <h3>Predict Quality Score</h3>
        </div>
        <div className="card-body">
          <p style={{ marginBottom: 'var(--space-md)' }}>
            Enter the length of your code (in characters or lines) to get a
            predicted quality score based on the platform's historical review data.
          </p>

          {/* Input and predict button */}
          <div className="form-inline" style={{ marginBottom: 'var(--space-lg)' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="codeLength">Code Length</label>
              <input
                id="codeLength"
                type="number"
                min={1}
                className="form-control"
                placeholder="e.g., 150"
                value={codeLength}
                onChange={(e) => setCodeLength(e.target.value)}
                style={{ maxWidth: '200px' }}
              />
            </div>

            <button
              className="btn btn-primary"
              onClick={handlePredict}
              disabled={predicting}
              style={{ alignSelf: 'flex-end' }}
            >
              {predicting ? 'Predicting...' : 'Predict Score'}
            </button>
          </div>

          {/* Loading indicator during prediction */}
          {predicting && <LoadingSpinner message="Generating prediction..." />}

          {/* ---- Prediction Results ---- */}
          {prediction && !predicting && (
            <div
              style={{
                backgroundColor: 'var(--bg-surface-elevated)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-lg)',
                marginTop: 'var(--space-md)',
              }}
            >
              <h3 style={{ marginBottom: 'var(--space-md)', fontSize: 'var(--font-lg)' }}>
                Prediction Results
              </h3>

              {/* Results displayed in a responsive grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: 'var(--space-lg)',
                  marginBottom: 'var(--space-md)',
                }}
              >
                {/* Predicted quality score */}
                <div className="stat-card">
                  <span className="stat-value">
                    {prediction.predictedScore !== undefined
                      ? Number(prediction.predictedScore).toFixed(2)
                      : prediction.score !== undefined
                        ? Number(prediction.score).toFixed(2)
                        : 'N/A'}
                  </span>
                  <span className="stat-label">Predicted Score</span>
                </div>

                {/* Trend direction indicator */}
                <div className="stat-card">
                  <span
                    className={getTrendBadgeClass(
                      prediction.trendDirection || prediction.trend
                    )}
                    style={{ fontSize: 'var(--font-lg)' }}
                  >
                    {getTrendIndicator(prediction.trendDirection || prediction.trend)}
                  </span>
                  <span className="stat-label">Trend Direction</span>
                </div>

                {/* Confidence level */}
                <div className="stat-card">
                  <span className="stat-value" style={{ fontSize: 'var(--font-2xl)' }}>
                    {prediction.confidence !== undefined
                      ? `${(Number(prediction.confidence) * 100).toFixed(1)}%`
                      : prediction.confidenceLevel || 'N/A'}
                  </span>
                  <span className="stat-label">Confidence</span>
                </div>
              </div>

              {/* Explanation text from the ML model */}
              {(prediction.explanation || prediction.message) && (
                <div
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-md)',
                    borderLeft: '4px solid var(--color-primary)',
                  }}
                >
                  <strong style={{ display: 'block', marginBottom: 'var(--space-xs)' }}>
                    Explanation
                  </strong>
                  <p style={{ color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
                    {prediction.explanation || prediction.message}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ================================================================
       * Section 2: Score Trend Forecast
       * Forecasts how review scores will evolve over future periods.
       * ================================================================ */}
      <div className="card">
        <div className="card-header">
          <h3>Score Trend Forecast</h3>
        </div>
        <div className="card-body">
          <p style={{ marginBottom: 'var(--space-md)' }}>
            Forecast how the average review score will trend over upcoming periods.
            Enter the number of future periods (weeks or months) to forecast.
          </p>

          {/* Input and forecast button */}
          <div className="form-inline" style={{ marginBottom: 'var(--space-lg)' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="periodsAhead">Periods Ahead</label>
              <input
                id="periodsAhead"
                type="number"
                min={1}
                max={52}
                className="form-control"
                placeholder="e.g., 4"
                value={periodsAhead}
                onChange={(e) => setPeriodsAhead(e.target.value)}
                style={{ maxWidth: '200px' }}
              />
            </div>

            <button
              className="btn btn-primary"
              onClick={handleForecast}
              disabled={forecasting}
              style={{ alignSelf: 'flex-end' }}
            >
              {forecasting ? 'Forecasting...' : 'Generate Forecast'}
            </button>
          </div>

          {/* Loading indicator during forecast */}
          {forecasting && <LoadingSpinner message="Generating forecast..." />}

          {/* ---- Trend Forecast Results ---- */}
          {trendData && !forecasting && (
            <div
              style={{
                backgroundColor: 'var(--bg-surface-elevated)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-lg)',
                marginTop: 'var(--space-md)',
              }}
            >
              <h3 style={{ marginBottom: 'var(--space-md)', fontSize: 'var(--font-lg)' }}>
                Forecast Results
              </h3>

              {/* Display forecast results as stat cards */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: 'var(--space-lg)',
                  marginBottom: 'var(--space-md)',
                }}
              >
                {/* Predicted score */}
                <div className="stat-card">
                  <span className="stat-value">
                    {trendData.predictedScore !== undefined
                      ? Number(trendData.predictedScore).toFixed(2)
                      : 'N/A'}
                  </span>
                  <span className="stat-label">Predicted Score</span>
                </div>

                {/* Trend direction */}
                <div className="stat-card">
                  <span
                    className={getTrendBadgeClass(trendData.trendDirection)}
                    style={{ fontSize: 'var(--font-lg)' }}
                  >
                    {getTrendIndicator(trendData.trendDirection)}
                  </span>
                  <span className="stat-label">Trend Direction</span>
                </div>

                {/* Confidence */}
                <div className="stat-card">
                  <span className="stat-value" style={{ fontSize: 'var(--font-2xl)' }}>
                    {trendData.confidence !== undefined
                      ? `${(Number(trendData.confidence) * 100).toFixed(1)}%`
                      : 'N/A'}
                  </span>
                  <span className="stat-label">Confidence</span>
                </div>

                {/* Data points used */}
                {trendData.dataPointsUsed !== undefined && (
                  <div className="stat-card">
                    <span className="stat-value">
                      {trendData.dataPointsUsed}
                    </span>
                    <span className="stat-label">Reviews Analyzed</span>
                  </div>
                )}
              </div>

              {/* Explanation text */}
              {trendData.explanation && (
                <div
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-md)',
                    borderLeft: '4px solid var(--color-accent)',
                  }}
                >
                  <strong style={{ display: 'block', marginBottom: 'var(--space-xs)' }}>
                    Trend Summary
                  </strong>
                  <p style={{ color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
                    {trendData.explanation}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default QualityForecast;
