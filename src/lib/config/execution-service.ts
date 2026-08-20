import { ExecutionConfig } from './types';

/**
 * Execution result interface
 */
export interface ExecutionResult {
  nodeId: string;
  label: string;
  type: string;
  result: string;
  success: boolean;
  error?: string;
  executionTime: number;
}

/**
 * Workflow execution result
 */
export interface WorkflowExecutionResult {
  success: boolean;
  aborted?: boolean;
  results: ExecutionResult[];
  totalExecutionTime: number;
  error?: string;
}

export const EXECUTION_ABORTED_MESSAGE = 'Execution aborted by user';

/**
 * Execution service for handling both simulation and real AWS execution
 */
export class ExecutionService {
  private config: ExecutionConfig;
  private abortController: AbortController | null = null;

  constructor(config: ExecutionConfig) {
    this.config = config;
  }

  /**
   * Update the configuration
   */
  updateConfig(config: ExecutionConfig): void {
    this.config = config;
  }

  /**
   * Execute a workflow with the given nodes and edges
   */
  async executeWorkflow(
    nodes: any[],
    edges: any[],
    onProgress?: (nodeId: string, status: 'running' | 'completed' | 'error') => void,
    onLog?: (level: 'info' | 'warning' | 'error' | 'success', message: string, agentId?: string) => void,
    onReasoning?: (agentId: string, step: string) => void
  ): Promise<WorkflowExecutionResult> {
    const abortController = new AbortController();
    this.abortController = abortController;
    const startTime = Date.now();
    const results: ExecutionResult[] = [];

    try {
      onLog?.('info', `Starting workflow execution with ${nodes.length} agent(s)...`);

      if (this.config.mode === 'simulation') {
        const simResults = await this.executeSimulation(
          nodes,
          edges,
          onProgress,
          onLog,
          onReasoning,
          abortController.signal
        );
        results.push(...simResults);
      } else {
        const realResults = await this.executeReal(
          nodes,
          edges,
          onProgress,
          onLog,
          onReasoning,
          abortController.signal
        );
        results.push(...realResults);
      }

      const totalExecutionTime = Date.now() - startTime;

      if (abortController.signal.aborted) {
        throw new Error(EXECUTION_ABORTED_MESSAGE);
      }
      
      onLog?.('success', 'Workflow execution completed successfully!');
      
      return {
        success: true,
        results,
        totalExecutionTime,
      };
    } catch (error) {
      const totalExecutionTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

      if (abortController.signal.aborted) {
        return {
          success: false,
          aborted: true,
          results,
          totalExecutionTime,
        };
      }

      // Enhanced error reporting for real mode
      if (this.config.mode === 'real') {
        onLog?.('error', `🚨 REAL AWS EXECUTION ERROR: ${errorMessage}`);
        onLog?.('error', `This is a real AWS infrastructure error - not a simulation`);
        onLog?.('error', `Please check: AWS credentials, API URL, Bedrock model access`);
      }

      onLog?.('error', `Workflow execution failed: ${errorMessage}`);
      
      return {
        success: false,
        results,
        totalExecutionTime,
        error: errorMessage,
      };
    } finally {
      this.abortController = null;
    }
  }

  /**
   * Execute workflow in simulation mode
   */
  private async executeSimulation(
    nodes: any[],
    edges: any[],
    onProgress?: (nodeId: string, status: 'running' | 'completed' | 'error') => void,
    onLog?: (level: 'info' | 'warning' | 'error' | 'success', message: string, agentId?: string) => void,
    onReasoning?: (agentId: string, step: string) => void,
    signal?: AbortSignal
  ): Promise<ExecutionResult[]> {
    const results: ExecutionResult[] = [];
    const { simulation } = this.config;

    for (const node of nodes) {
      if (signal?.aborted) {
        throw new Error(EXECUTION_ABORTED_MESSAGE);
      }

      const nodeType = node.data.type;
      const nodeId = node.id;
      const nodeLabel = node.data.label;

      onProgress?.(nodeId, 'running');
      onLog?.('info', `${nodeLabel}: Starting execution...`, nodeId);

      // Add reasoning step based on agent type
      switch (nodeType) {
        case 'analyzer':
          onReasoning?.(nodeId, 'Analyzing input patterns and extracting key features...');
          break;
        case 'summarizer':
          onReasoning?.(nodeId, 'Condensing analyzed data into concise format...');
          break;
        case 'validator':
          onReasoning?.(nodeId, 'Checking against quality standards and validation rules...');
          break;
      }

      // Get execution time based on agent type
      const executionTime = simulation.executionTimes[nodeType as keyof typeof simulation.executionTimes] || 
                           simulation.executionTimes.default;

      // Simulate execution delay
      await this.delay(executionTime, signal);

      // Check if we should simulate an error
      let shouldError = false;
      if (simulation.errorSimulation.enabled) {
        if (simulation.errorSimulation.randomErrors) {
          shouldError = Math.random() < simulation.errorSimulation.errorRate;
        }
      }

      let result = '';
      let success = true;
      let error = undefined;

      if (shouldError) {
        success = false;
        error = 'Simulated execution error';
        result = 'Execution failed';
        onProgress?.(nodeId, 'error');
        onLog?.('error', `${nodeLabel}: ${error}`, nodeId);
      } else {
        // Generate result based on agent type
        switch (nodeType) {
          case 'analyzer':
            const patterns = simulation.resultGeneration.randomizeResults
              ? Math.floor(Math.random() * (simulation.resultGeneration.maxPatterns - simulation.resultGeneration.minPatterns)) + simulation.resultGeneration.minPatterns
              : simulation.resultGeneration.minPatterns;
            result = `Extracted ${patterns} key patterns from input data`;
            break;
          case 'summarizer':
            const summaryLength = simulation.resultGeneration.randomizeResults
              ? Math.floor(Math.random() * (simulation.resultGeneration.maxSummaryLength - simulation.resultGeneration.minSummaryLength)) + simulation.resultGeneration.minSummaryLength
              : simulation.resultGeneration.minSummaryLength;
            result = `Generated ${summaryLength}-character summary`;
            break;
          case 'validator':
            result = `All quality checks passed (strictness: ${node.data.config.strictness || 'medium'})`;
            break;
          default:
            result = 'Execution completed';
        }

        onProgress?.(nodeId, 'completed');
        onLog?.('success', `${nodeLabel}: ${result}`, nodeId);
      }

      results.push({
        nodeId,
        label: nodeLabel,
        type: nodeType,
        result,
        success,
        error,
        executionTime,
      });
    }

    return results;
  }

  /**
   * Execute workflow in real AWS mode
   */
  private async executeReal(
    nodes: any[],
    edges: any[],
    onProgress?: (nodeId: string, status: 'running' | 'completed' | 'error') => void,
    onLog?: (level: 'info' | 'warning' | 'error' | 'success', message: string, agentId?: string) => void,
    onReasoning?: (agentId: string, step: string) => void,
    signal?: AbortSignal
  ): Promise<ExecutionResult[]> {
    const results: ExecutionResult[] = [];
    const { aws, retry, timeout } = this.config;

    // Validate AWS configuration
    if (!aws.accessKeyId || !aws.secretAccessKey) {
      throw new Error('AWS credentials are not configured');
    }

    if (!aws.apiUrl) {
      throw new Error('AWS API URL is not configured');
    }

    onLog?.('info', 'Executing workflow in real AWS mode...');
    onLog?.('warning', 'Real AWS execution - any errors will be reported immediately');

    // This is a placeholder for real AWS execution
    // In a real implementation, this would use AWS SDK to invoke Lambda functions or Step Functions
    
    for (const node of nodes) {
      if (signal?.aborted) {
        throw new Error(EXECUTION_ABORTED_MESSAGE);
      }

      const nodeType = node.data.type;
      const nodeId = node.id;
      const nodeLabel = node.data.label;

      onProgress?.(nodeId, 'running');
      onLog?.('info', `${nodeLabel}: Executing on AWS...`, nodeId);
      onReasoning?.(nodeId, 'Invoking AWS Lambda function...');

      try {
        // Real AWS API call to deployed infrastructure
        const result = await this.executeWithRetry(
          async () => {
            const apiUrl = (aws.apiUrl || '').replace(/\/$/, '');
            const response = await fetch(`${apiUrl}/agents/execute`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer sk-test-key`, // Using test key for now
              },
              body: JSON.stringify({
                agentType: nodeType,
                prompt: node.data.config?.prompt || 'Execute agent',
                modelId: aws.modelId || 'meta.llama3-8b-instruct-v1:0',
              }),
              signal,
            });

            if (!response.ok) {
              const errorText = await response.text();
              throw new Error(`AWS API error (${response.status}): ${errorText}`);
            }

            const data = await response.json();
            
            if (!data.success) {
              throw new Error(`AWS execution failed: ${data.error || 'Unknown error'}`);
            }
            
            return {
              success: true,
              result: data.result || 'AWS execution completed',
            };
          },
          retry,
          timeout.nodeExecution,
          signal
        );

        onProgress?.(nodeId, 'completed');
        onLog?.('success', `${nodeLabel}: ${result.result}`, nodeId);

        results.push({
          nodeId,
          label: nodeLabel,
          type: nodeType,
          result: result.result,
          success: true,
          executionTime: 2000, // This would be actual execution time
        });
      } catch (error) {
        if (signal?.aborted) {
          throw new Error(EXECUTION_ABORTED_MESSAGE);
        }

        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        // Critical: In real mode, alert immediately and don't continue
        onProgress?.(nodeId, 'error');
        onLog?.('error', `${nodeLabel}: AWS execution error - ${errorMessage}`, nodeId);
        onLog?.('error', `🚨 REAL AWS MODE - Execution stopped due to error`, nodeId);
        onLog?.('error', `Error details: ${errorMessage}`, nodeId);

        results.push({
          nodeId,
          label: nodeLabel,
          type: nodeType,
          result: 'AWS execution failed',
          success: false,
          error: errorMessage,
          executionTime: 0,
        });

        // In real mode, stop execution immediately to clearly show the error
        throw new Error(`Real AWS execution failed for ${nodeLabel}: ${errorMessage}`);
      }
    }

    return results;
  }

  /**
   * Execute with retry logic
   */
  private async executeWithRetry<T>(
    fn: () => Promise<T>,
    retryConfig: ExecutionConfig['retry'],
    timeout: number,
    signal?: AbortSignal
  ): Promise<T> {
    let lastError: Error | null = null;
    let delay = retryConfig.retryDelay;

    for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
      if (signal?.aborted) {
        throw new Error(EXECUTION_ABORTED_MESSAGE);
      }

      try {
        // Execute with timeout
        const result = await Promise.race([
          fn(),
          this.createTimeoutPromise(timeout),
        ]);
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');

        if (attempt < retryConfig.maxRetries) {
          const waitTime = retryConfig.exponentialBackoff 
            ? delay * retryConfig.backoffMultiplier 
            : delay;
          
          await this.delay(waitTime, signal);
          
          if (retryConfig.exponentialBackoff) {
            delay *= retryConfig.backoffMultiplier;
          }
        }
      }
    }

    throw lastError || new Error('Max retries exceeded');
  }

  /**
   * Create a timeout promise
   */
  private createTimeoutPromise(timeout: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Operation timed out after ${timeout}ms`)), timeout);
    });
  }

  /**
   * Delay helper with abort support
   */
  private delay(ms: number, signal?: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => resolve(), ms);
      
      if (signal) {
        signal.addEventListener('abort', () => {
          clearTimeout(timeout);
          reject(new Error(EXECUTION_ABORTED_MESSAGE));
        });
      }
    });
  }

  /**
   * Abort the current execution
   */
  abort(): void {
    this.abortController?.abort();
  }

  /**
   * Check if execution is currently running
   */
  isRunning(): boolean {
    return this.abortController !== null;
  }
}