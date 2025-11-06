export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const ENVIRONMENT = process.env.REACT_APP_ENVIRONMENT || 'development';

export const config = {
    apiUrl: API_URL,
    environment: ENVIRONMENT,
    isDevelopment: ENVIRONMENT === 'development',
    isProduction: ENVIRONMENT === 'production'
};

export default config;
