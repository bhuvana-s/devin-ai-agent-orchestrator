/**
 * Execution mode types
 */
export type ExecutionMode = 'simulation' | 'real';

/**
 * Simulation configuration parameters
 */
export interface SimulationConfig {
  executionTimes: {
    analyzer: number;      // milliseconds
    summarizer: number;    // milliseconds
    validator: number;     // milliseconds
    default: number;       // milliseconds
  };
  resultGeneration: {
    randomizeResults: boolean;
    minPatterns: number;
    maxPatterns: number;
    minSummaryLength: number;
    maxSummaryLength: number;
  };
  errorSimulation: {
    enabled: boolean;
    errorRate: number;     // 0-1
    randomErrors: boolean;
  };
}

/**
 * AWS configuration for real execution
 */
export interface AWSConfig {
  region: string;
  accessKeyId: string;     // In production, this should be handled securely
  secretAccessKey: string; // In production, this should be handled securely
  sessionToken?: string;
  lambdaFunctionName?: string;
  stepFunctionArn?: string;
  s3Bucket?: string;
}

/**
 * Execution retry configuration
 */
export interface RetryConfig {
  maxRetries: number;
  retryDelay: number;      // milliseconds
  exponentialBackoff: boolean;
  backoffMultiplier: number;
}

/**
 * Timeout configuration
 */
export interface TimeoutConfig {
  nodeExecution: number;   // milliseconds per node
  totalWorkflow: number;   // milliseconds for entire workflow
  apiRequest: number;      // milliseconds for API calls
}

/**
 * Main execution configuration
 */
export interface ExecutionConfig {
  mode: ExecutionMode;
  simulation: SimulationConfig;
  aws: AWSConfig;
  retry: RetryConfig;
  timeout: TimeoutConfig;
}

/**
 * Configuration validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Configuration change event
 */
export interface ConfigChangeEvent {
  type: 'mode' | 'simulation' | 'aws' | 'retry' | 'timeout' | 'full';
  oldValue: any;
  newValue: any;
  timestamp: Date;
}