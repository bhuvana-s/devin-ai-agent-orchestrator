import { ExecutionConfig } from './types';

/**
 * Default simulation configuration
 */
export const DEFAULT_SIMULATION_CONFIG = {
  executionTimes: {
    analyzer: 1500,
    summarizer: 1200,
    validator: 1000,
    default: 1000,
  },
  resultGeneration: {
    randomizeResults: true,
    minPatterns: 5,
    maxPatterns: 25,
    minSummaryLength: 200,
    maxSummaryLength: 500,
  },
  errorSimulation: {
    enabled: false,
    errorRate: 0.1,
    randomErrors: false,
  },
};

/**
 * Default AWS configuration
 */
export const DEFAULT_AWS_CONFIG = {
  region: 'us-east-1',
  accessKeyId: '',
  secretAccessKey: '',
  sessionToken: '',
  lambdaFunctionName: 'AI-Agent-Dashboard-Executor-production',
  stepFunctionArn: '',
  s3Bucket: '',
  apiUrl: 'https://rkx19twzgk.execute-api.us-east-1.amazonaws.com/production/',
};

/**
 * Default retry configuration
 */
export const DEFAULT_RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000,
  exponentialBackoff: true,
  backoffMultiplier: 2,
};

/**
 * Default timeout configuration
 */
export const DEFAULT_TIMEOUT_CONFIG = {
  nodeExecution: 30000,      // 30 seconds per node
  totalWorkflow: 300000,     // 5 minutes total
  apiRequest: 10000,         // 10 seconds per API call
};

/**
 * Complete default configuration
 */
export const DEFAULT_EXECUTION_CONFIG: ExecutionConfig = {
  mode: 'simulation',
  simulation: DEFAULT_SIMULATION_CONFIG,
  aws: DEFAULT_AWS_CONFIG,
  retry: DEFAULT_RETRY_CONFIG,
  timeout: DEFAULT_TIMEOUT_CONFIG,
};

/**
 * Configuration presets for different use cases
 */
export const CONFIG_PRESETS = {
  fast: {
    ...DEFAULT_EXECUTION_CONFIG,
    simulation: {
      ...DEFAULT_SIMULATION_CONFIG,
      executionTimes: {
        analyzer: 500,
        summarizer: 400,
        validator: 300,
        default: 300,
      },
    },
  },
  realistic: {
    ...DEFAULT_EXECUTION_CONFIG,
    simulation: {
      ...DEFAULT_SIMULATION_CONFIG,
      executionTimes: {
        analyzer: 3000,
        summarizer: 2500,
        validator: 2000,
        default: 2000,
      },
    },
  },
  testing: {
    ...DEFAULT_EXECUTION_CONFIG,
    simulation: {
      ...DEFAULT_SIMULATION_CONFIG,
      executionTimes: {
        analyzer: 200,
        summarizer: 150,
        validator: 100,
        default: 100,
      },
      errorSimulation: {
        enabled: true,
        errorRate: 0.3,
        randomErrors: true,
      },
    },
  },
};