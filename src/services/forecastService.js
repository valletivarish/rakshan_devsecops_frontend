/**
 * forecastService.js - Forecast / ML Prediction API Service
 *
 * Interfaces with the backend's machine-learning prediction endpoints.
 * These endpoints use trained models to provide forecasts that help
 * users understand expected code quality and review trends.
 *
 * Available operations:
 * - predictQualityScore: Predict the expected quality score based on code length
 * - predictScoreTrend:   Forecast how review scores will trend over future periods
 */

import api from "./api";

/**
 * Base path for forecast endpoints on the Spring Boot backend.
 */
const FORECAST_BASE = "/forecast";

/**
 * forecastService - Encapsulates all forecast/prediction API calls.
 */
const forecastService = {
  /**
   * predictQualityScore - Predict the expected quality score for a given code length.
   *
   * Uses a regression model on the backend to estimate the quality
   * score a code submission of the given length is likely to receive.
   * This can help authors gauge whether their submission is within
   * an acceptable size range.
   *
   * @param {number} codeLength - The length of the code in characters or lines
   * @returns {Promise<import('axios').AxiosResponse>} Prediction result with the estimated score
   */
  predictQualityScore(codeLength) {
    return api.get(`${FORECAST_BASE}/predict`, {
      params: { codeLength },
    });
  },

  /**
   * predictScoreTrend - Forecast review score trends over upcoming periods.
   *
   * Uses a time-series forecasting model to predict how the average
   * review score will evolve over the specified number of future periods
   * (e.g., weeks or months). Useful for platform analytics and planning.
   *
   * @param {number} periodsAhead - Number of future periods to forecast
   * @returns {Promise<import('axios').AxiosResponse>} Trend forecast data points
   */
  predictScoreTrend(periodsAhead) {
    return api.get(`${FORECAST_BASE}/trend`, {
      params: { periodsAhead },
    });
  },
};

export default forecastService;
