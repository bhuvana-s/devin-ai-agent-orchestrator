import { useConfigStore } from './store';
import { ExecutionMode } from './types';

/**
 * Custom hook for accessing execution configuration
 */
export function useExecutionConfig() {
  const config = useConfigStore();
  
  return {
    // Current configuration
    mode: config.config.mode,
    simulation: config.config.simulation,
    aws: config.config.aws,
    retry: config.config.retry,
    timeout: config.config.timeout,
    
    // Validation state
    isValid: config.validationErrors.length === 0,
    errors: config.validationErrors,
    warnings: config.validationWarnings,
    isDirty: config.isDirty,
    
    // Actions
    setMode: config.setMode,
    setSimulationConfig: config.setSimulationConfig,
    setAWSConfig: config.setAWSConfig,
    setRetryConfig: config.setRetryConfig,
    setTimeoutConfig: config.setTimeoutConfig,
    applyPreset: config.applyPreset,
    resetToDefaults: config.resetToDefaults,
    validate: config.validate,
    
    // Helpers
    isSimulationMode: config.config.mode === 'simulation',
    isRealMode: config.config.mode === 'real',
  };
}

/**
 * Custom hook for simulation-specific configuration
 */
export function useSimulationConfig() {
  const config = useConfigStore();
  const simulation = config.config.simulation;
  
  return {
    executionTimes: simulation.executionTimes,
    resultGeneration: simulation.resultGeneration,
    errorSimulation: simulation.errorSimulation,
    
    setExecutionTimes: (times: Partial<typeof simulation.executionTimes>) => {
      config.setSimulationConfig({ executionTimes: { ...simulation.executionTimes, ...times } });
    },
    
    setResultGeneration: (gen: Partial<typeof simulation.resultGeneration>) => {
      config.setSimulationConfig({ resultGeneration: { ...simulation.resultGeneration, ...gen } });
    },
    
    setErrorSimulation: (err: Partial<typeof simulation.errorSimulation>) => {
      config.setSimulationConfig({ errorSimulation: { ...simulation.errorSimulation, ...err } });
    },
  };
}

/**
 * Custom hook for AWS-specific configuration
 */
export function useAWSConfig() {
  const config = useConfigStore();
  const aws = config.config.aws;
  
  return {
    region: aws.region,
    accessKeyId: aws.accessKeyId,
    secretAccessKey: aws.secretAccessKey,
    sessionToken: aws.sessionToken,
    lambdaFunctionName: aws.lambdaFunctionName,
    stepFunctionArn: aws.stepFunctionArn,
    s3Bucket: aws.s3Bucket,
    
    setRegion: (region: string) => config.setAWSConfig({ region }),
    setCredentials: (accessKeyId: string, secretAccessKey: string) => {
      config.setAWSConfig({ accessKeyId, secretAccessKey });
    },
    setLambdaFunction: (name: string) => config.setAWSConfig({ lambdaFunctionName: name }),
    setStepFunction: (arn: string) => config.setAWSConfig({ stepFunctionArn: arn }),
    setS3Bucket: (bucket: string) => config.setAWSConfig({ s3Bucket: bucket }),
  };
}