import { ExecutionConfig, ValidationResult } from './types';

/**
 * Validates execution configuration
 */
export function validateExecutionConfig(config: Partial<ExecutionConfig>): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate simulation config
  if (config.simulation) {
    const sim = config.simulation;
    
    // Validate execution times
    if (sim.executionTimes) {
      if (sim.executionTimes.analyzer < 0) {
        errors.push('Analyzer execution time cannot be negative');
      }
      if (sim.executionTimes.summarizer < 0) {
        errors.push('Summarizer execution time cannot be negative');
      }
      if (sim.executionTimes.validator < 0) {
        errors.push('Validator execution time cannot be negative');
      }
      if (sim.executionTimes.default < 0) {
        errors.push('Default execution time cannot be negative');
      }
      
      if (sim.executionTimes.analyzer > 60000) {
        warnings.push('Analyzer execution time is very long (>60s)');
      }
    }

    // Validate result generation
    if (sim.resultGeneration) {
      if (sim.resultGeneration.minPatterns < 0) {
        errors.push('Minimum patterns cannot be negative');
      }
      if (sim.resultGeneration.maxPatterns < sim.resultGeneration.minPatterns) {
        errors.push('Maximum patterns must be greater than minimum patterns');
      }
      if (sim.resultGeneration.minSummaryLength < 0) {
        errors.push('Minimum summary length cannot be negative');
      }
      if (sim.resultGeneration.maxSummaryLength < sim.resultGeneration.minSummaryLength) {
        errors.push('Maximum summary length must be greater than minimum summary length');
      }
    }

    // Validate error simulation
    if (sim.errorSimulation) {
      if (sim.errorSimulation.errorRate < 0 || sim.errorSimulation.errorRate > 1) {
        errors.push('Error rate must be between 0 and 1');
      }
    }
  }

  // Validate AWS config
  if (config.aws) {
    const aws = config.aws;
    
    if (aws.region && !isValidAWSRegion(aws.region)) {
      warnings.push('AWS region may not be valid');
    }
    
    // Only validate credentials if mode is explicitly set to 'real'
    if (config.mode === 'real') {
      if (!aws.accessKeyId || aws.accessKeyId.trim() === '') {
        errors.push('AWS Access Key ID is required for real execution mode');
      }
      if (!aws.secretAccessKey || aws.secretAccessKey.trim() === '') {
        errors.push('AWS Secret Access Key is required for execution mode');
      }
      // Lambda function is optional - we have a default one deployed
      if (!aws.lambdaFunctionName && !aws.stepFunctionArn) {
        warnings.push('No Lambda function or Step Function configured - using defaults');
      }
    }
  }

  // Validate retry config
  if (config.retry) {
    const retry = config.retry;
    
    if (retry.maxRetries < 0) {
      errors.push('Max retries cannot be negative');
    }
    if (retry.maxRetries > 10) {
      warnings.push('Max retries is very high (>10), may cause long delays');
    }
    if (retry.retryDelay < 0) {
      errors.push('Retry delay cannot be negative');
    }
    if (retry.backoffMultiplier < 1) {
      errors.push('Backoff multiplier must be at least 1');
    }
  }

  // Validate timeout config
  if (config.timeout) {
    const timeout = config.timeout;
    
    if (timeout.nodeExecution < 1000) {
      warnings.push('Node execution timeout is very short (<1s)');
    }
    if (timeout.totalWorkflow < timeout.nodeExecution) {
      errors.push('Total workflow timeout must be greater than node execution timeout');
    }
    if (timeout.apiRequest < 1000) {
      warnings.push('API request timeout is very short (<1s)');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates AWS region format
 */
function isValidAWSRegion(region: string): boolean {
  const validRegions = [
    'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
    'eu-west-1', 'eu-west-2', 'eu-west-3', 'eu-central-1',
    'ap-northeast-1', 'ap-northeast-2', 'ap-southeast-1', 'ap-southeast-2',
    'ap-south-1', 'ca-central-1', 'sa-east-1',
  ];
  return validRegions.includes(region);
}

/**
 * Validates execution mode
 */
export function isValidExecutionMode(mode: string): mode is 'simulation' | 'real' {
  return mode === 'simulation' || mode === 'real';
}

/**
 * Sanitizes configuration by removing sensitive data
 */
export function sanitizeConfig(config: ExecutionConfig): Partial<ExecutionConfig> {
  const sanitized = { ...config };
  
  if (sanitized.aws) {
    sanitized.aws = {
      ...sanitized.aws,
      accessKeyId: sanitized.aws.accessKeyId ? '***REDACTED***' : '',
      secretAccessKey: sanitized.aws.secretAccessKey ? '***REDACTED***' : '',
      sessionToken: sanitized.aws.sessionToken ? '***REDACTED***' : '',
    };
  }
  
  return sanitized;
}