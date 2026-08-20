import { Context, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { createResponse } from '../layers/utils/response';

interface HealthCheckResponse {
  status: string;
  timestamp: string;
  environment: string;
  version: string;
  region: string;
  checks: {
    lambda: boolean;
    bedrock: boolean;
    memory: boolean;
  };
}

/**
 * Health check endpoint for monitoring
 */
export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  console.log('Health check invoked');
  
  try {
    const checks = {
      lambda: true,
      bedrock: await checkBedrockAccess(),
      memory: checkMemoryUsage(),
    };

    const allHealthy = Object.values(checks).every(check => check === true);

    const response: HealthCheckResponse = {
      status: allHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      environment: process.env.ENVIRONMENT || 'unknown',
      version: '1.0.0',
      region: process.env.AWS_REGION || 'unknown',
      checks,
    };

    console.log('Health check result:', JSON.stringify(response, null, 2));
    
    return createResponse(allHealthy ? 200 : 503, response, event.headers);

  } catch (error) {
    console.error('Health check error:', error);
    
    return createResponse(503, {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    }, event.headers);
  }
};

/**
 * Check Bedrock access (simple check)
 */
async function checkBedrockAccess(): Promise<boolean> {
  try {
    // In a real implementation, you would make a simple call to Bedrock
    // For now, we'll just check if the environment variables are set
    return !!(process.env.BEDROCK_REGION);
  } catch (error) {
    console.error('Bedrock check failed:', error);
    return false;
  }
}

/**
 * Check memory usage
 */
function checkMemoryUsage(): boolean {
  try {
    const used = process.memoryUsage();
    const totalMemory = 512; // MB (configured in Lambda)
    const usedMB = used.heapUsed / 1024 / 1024;
    
    // Consider healthy if using less than 80% of allocated memory
    return usedMB < (totalMemory * 0.8);
  } catch (error) {
    console.error('Memory check failed:', error);
    return false;
  }
}
