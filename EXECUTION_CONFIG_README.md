# Execution Configuration System

## Overview

The Execution Configuration System provides a comprehensive, type-safe solution for managing AI Agent Dashboard execution settings. It supports both simulation and real AWS execution modes with extensive customization options.

## Features

### 1. Execution Mode Configuration
- **Simulation Mode**: Run workflows locally with simulated results
- **Real AWS Mode**: Execute workflows on actual AWS infrastructure
- Seamless mode switching via UI toggle
- Configuration validation before execution

### 2. Simulation Configuration
- **Execution Times**: Customize execution duration for each agent type
- **Result Generation**: Configure randomized result generation parameters
- **Error Simulation**: Enable simulated errors for testing purposes
- Preset configurations for different use cases (fast, realistic, testing)

### 3. AWS Configuration
- **Region Selection**: Support for multiple AWS regions
- **Credential Management**: Secure input of AWS credentials
- **Service Configuration**: Lambda functions, Step Functions, S3 buckets
- Validation of required credentials for real execution

### 4. Advanced Configuration
- **Retry Logic**: Configurable retry attempts with exponential backoff
- **Timeout Settings**: Granular timeout control for different operations
- **Error Handling**: Comprehensive error handling and validation
- **Configuration Persistence**: Automatic saving to localStorage

## Architecture

### Type System

```typescript
// Core Types
type ExecutionMode = 'simulation' | 'real';

interface SimulationConfig {
  executionTimes: { analyzer: number; summarizer: number; validator: number; default: number };
  resultGeneration: { randomizeResults: boolean; minPatterns: number; maxPatterns: number; ... };
  errorSimulation: { enabled: boolean; errorRate: number; randomErrors: boolean };
}

interface AWSConfig {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  lambdaFunctionName?: string;
  stepFunctionArn?: string;
  s3Bucket?: string;
}

interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  exponentialBackoff: boolean;
  backoffMultiplier: number;
}

interface TimeoutConfig {
  nodeExecution: number;
  totalWorkflow: number;
  apiRequest: number;
}
```

### Configuration Store

The configuration is managed using Zustand with persistence:

```typescript
const useConfigStore = create<ConfigState>()(
  persist(
    (set, get) => ({
      config: DEFAULT_EXECUTION_CONFIG,
      validationErrors: [],
      validationWarnings: [],
      // ... actions
    }),
    { name: 'execution-config-storage' }
  )
);
```

### Execution Service

The `ExecutionService` class handles both simulation and real execution:

```typescript
class ExecutionService {
  constructor(config: ExecutionConfig);
  executeWorkflow(nodes, edges, onProgress, onLog, onReasoning): Promise<WorkflowExecutionResult>;
  abort(): void;
  isRunning(): boolean;
}
```

## Usage

### Basic Usage

```typescript
import { useExecutionConfig } from '@/lib/config';

function MyComponent() {
  const { mode, setMode, isSimulationMode } = useExecutionConfig();
  
  return (
    <button onClick={() => setMode('real')}>
      Switch to Real Mode
    </button>
  );
}
```

### Advanced Usage with Execution Service

```typescript
import { ExecutionService } from '@/lib/config/execution-service';
import { useConfigStore } from '@/lib/config/store';

function WorkflowExecutor() {
  const config = useConfigStore();
  const [service] = useState(() => new ExecutionService(config.config));
  
  const execute = async () => {
    const result = await service.executeWorkflow(
      nodes,
      edges,
      (nodeId, status) => console.log(`${nodeId}: ${status}`),
      (level, message) => console.log(`[${level}] ${message}`),
      (agentId, step) => console.log(`${agentId}: ${step}`)
    );
  };
}
```

### Configuration Presets

```typescript
import { useConfigStore } from '@/lib/config/store';

function PresetSelector() {
  const { applyPreset } = useConfigStore();
  
  return (
    <div>
      <button onClick={() => applyPreset('fast')}>Fast Mode</button>
      <button onClick={() => applyPreset('realistic')}>Realistic Mode</button>
      <button onClick={() => applyPreset('testing')}>Testing Mode</button>
    </div>
  );
}
```

## UI Components

### Settings Modal

The `SettingsModal` component provides a comprehensive UI for configuration:

```typescript
import { SettingsModal } from '@/components/settings';

function App() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open Settings</button>
      <SettingsModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
```

### Execution Mode Toggle

The `ExecutionModeToggle` component provides a quick mode switcher:

```typescript
import { ExecutionModeToggle } from '@/components/settings';

function Navbar() {
  return (
    <nav>
      <ExecutionModeToggle />
    </nav>
  );
}
```

## Configuration Validation

The system includes comprehensive validation:

```typescript
import { validateExecutionConfig } from '@/lib/config/validation';

const validation = validateExecutionConfig(config);
if (!validation.isValid) {
  console.error('Validation errors:', validation.errors);
  console.warn('Validation warnings:', validation.warnings);
}
```

## Security Considerations

1. **Credential Storage**: AWS credentials are stored in localStorage. In production, implement secure credential management.
2. **Sanitization**: The `sanitizeConfig` function removes sensitive data when logging or exporting.
3. **Validation**: All configuration changes are validated before application.

## Persistence

Configuration is automatically persisted to localStorage under the key `execution-config-storage`. This ensures settings are maintained across browser sessions.

## Error Handling

The system includes comprehensive error handling:

- **Validation Errors**: Prevent invalid configurations
- **Execution Errors**: Graceful handling of execution failures
- **Network Errors**: Retry logic with exponential backoff
- **Timeout Errors**: Configurable timeout handling

## Extensibility

The system is designed for easy extension:

1. **Add New Agent Types**: Extend `SimulationConfig` execution times
2. **Custom Presets**: Add new presets to `CONFIG_PRESETS`
3. **Additional Validation**: Extend `validateExecutionConfig` function
4. **Custom Execution**: Extend `ExecutionService` for new execution modes

## Testing

The system includes a testing preset with configurable error simulation:

```typescript
const testingConfig = {
  ...DEFAULT_EXECUTION_CONFIG,
  simulation: {
    executionTimes: { analyzer: 200, summarizer: 150, validator: 100, default: 100 },
    errorSimulation: { enabled: true, errorRate: 0.3, randomErrors: true },
  },
};
```

## Future Enhancements

Potential future improvements:

1. **Cloud Configuration Sync**: Sync settings across devices
2. **Team Configuration**: Share configurations within teams
3. **Configuration Templates**: Save and load configuration templates
4. **Audit Logging**: Track configuration changes
5. **Advanced Scheduling**: Schedule executions with specific configurations
6. **Multi-Region Support**: Execute across multiple AWS regions
7. **Cost Estimation**: Estimate AWS execution costs

## Troubleshooting

### Configuration Not Saving
- Check browser localStorage permissions
- Verify `execution-config-storage` key exists in localStorage
- Check for browser privacy settings blocking storage

### Validation Errors
- Review validation errors in Settings modal
- Ensure required fields are populated for real execution mode
- Check numeric ranges are within valid limits

### Execution Failures
- Verify AWS credentials for real execution mode
- Check network connectivity
- Review timeout configurations
- Examine execution logs for detailed error information

## API Reference

### Types

- `ExecutionMode`: 'simulation' | 'real'
- `ExecutionConfig`: Main configuration interface
- `SimulationConfig`: Simulation-specific settings
- `AWSConfig`: AWS configuration settings
- `RetryConfig`: Retry logic settings
- `TimeoutConfig`: Timeout settings
- `ValidationResult`: Validation result interface
- `ConfigChangeEvent`: Configuration change event interface

### Functions

- `validateExecutionConfig(config)`: Validate configuration
- `sanitizeConfig(config)`: Remove sensitive data
- `isValidExecutionMode(mode)`: Validate execution mode

### Classes

- `ExecutionService`: Main execution service class

### Hooks

- `useExecutionConfig()`: Access full configuration
- `useSimulationConfig()`: Access simulation settings
- `useAWSConfig()`: Access AWS settings

### Components

- `SettingsModal`: Comprehensive settings UI
- `ExecutionModeToggle`: Mode toggle component