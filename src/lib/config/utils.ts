import { ExecutionConfig } from './types';

/**
 * Deep clone a configuration object
 */
export function cloneConfig(config: ExecutionConfig): ExecutionConfig {
  return JSON.parse(JSON.stringify(config));
}

/**
 * Merge two configuration objects
 */
export function mergeConfigs(base: ExecutionConfig, override: Partial<ExecutionConfig>): ExecutionConfig {
  return {
    ...base,
    ...override,
    simulation: { ...base.simulation, ...override.simulation },
    aws: { ...base.aws, ...override.aws },
    retry: { ...base.retry, ...override.retry },
    timeout: { ...base.timeout, ...override.timeout },
  };
}

/**
 * Export configuration to JSON string
 */
export function configToJSON(config: ExecutionConfig, pretty: boolean = false): string {
  return JSON.stringify(config, null, pretty ? 2 : 0);
}

/**
 * Import configuration from JSON string
 */
export function configFromJSON(jsonString: string): ExecutionConfig {
  try {
    return JSON.parse(jsonString) as ExecutionConfig;
  } catch (error) {
    throw new Error('Invalid configuration JSON');
  }
}

/**
 * Download configuration as JSON file
 */
export function downloadConfig(config: ExecutionConfig, filename: string = 'agent-config.json'): void {
  const json = configToJSON(config, true);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Read configuration from JSON file
 */
export async function readConfigFromFile(file: File): Promise<ExecutionConfig> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const config = configFromJSON(e.target?.result as string);
        resolve(config);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

/**
 * Get configuration summary
 */
export function getConfigSummary(config: ExecutionConfig): string {
  const parts: string[] = [];
  
  parts.push(`Mode: ${config.mode.toUpperCase()}`);
  
  if (config.mode === 'simulation') {
    parts.push(`Execution Times: ${Object.values(config.simulation.executionTimes).join('ms, ')}ms`);
    parts.push(`Error Simulation: ${config.simulation.errorSimulation.enabled ? 'Enabled' : 'Disabled'}`);
  } else {
    parts.push(`AWS Region: ${config.aws.region}`);
    parts.push(`Lambda: ${config.aws.lambdaFunctionName || 'Not configured'}`);
  }
  
  parts.push(`Max Retries: ${config.retry.maxRetries}`);
  parts.push(`Timeout: ${config.timeout.nodeExecution}ms per node`);
  
  return parts.join('\n');
}

/**
 * Compare two configurations
 */
export function compareConfigs(config1: ExecutionConfig, config2: ExecutionConfig): {
  equal: boolean;
  differences: string[];
} {
  const differences: string[] = [];
  
  if (config1.mode !== config2.mode) {
    differences.push(`Mode: ${config1.mode} vs ${config2.mode}`);
  }
  
  // Compare simulation config
  if (config1.mode === 'simulation' && config2.mode === 'simulation') {
    if (JSON.stringify(config1.simulation) !== JSON.stringify(config2.simulation)) {
      differences.push('Simulation configuration differs');
    }
  }
  
  // Compare AWS config
  if (config1.mode === 'real' && config2.mode === 'real') {
    if (config1.aws.region !== config2.aws.region) {
      differences.push(`AWS Region: ${config1.aws.region} vs ${config2.aws.region}`);
    }
    if (config1.aws.lambdaFunctionName !== config2.aws.lambdaFunctionName) {
      differences.push('Lambda function name differs');
    }
  }
  
  // Compare retry config
  if (JSON.stringify(config1.retry) !== JSON.stringify(config2.retry)) {
    differences.push('Retry configuration differs');
  }
  
  // Compare timeout config
  if (JSON.stringify(config1.timeout) !== JSON.stringify(config2.timeout)) {
    differences.push('Timeout configuration differs');
  }
  
  return {
    equal: differences.length === 0,
    differences,
  };
}