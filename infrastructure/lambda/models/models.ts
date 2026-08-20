import { Context, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { BedrockClient, ListFoundationModelsCommand } from '@aws-sdk/client-bedrock';

// Bedrock client
const bedrockClient = new BedrockClient({
  region: process.env.BEDROCK_REGION || 'us-east-1',
});

interface ModelInfo {
  modelId: string;
  modelName: string;
  provider: string;
  inputModalities: string[];
  outputModalities: string[];
  responseStreamingSupported: boolean;
}

interface ModelsResponse {
  success: boolean;
  models?: ModelInfo[];
  error?: string;
  count?: number;
}

/**
 * List available Bedrock models
 */
export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  console.log('Models list invoked');
  
  try {
    const command = new ListFoundationModelsCommand({
      byProvider: undefined,
      byOutputModality: 'TEXT',
      byInferenceType: 'ON_DEMAND',
    });

    const response = await bedrockClient.send(command);
    
    const models: ModelInfo[] = (response.modelSummaries || []).map(model => ({
      modelId: model.modelId || '',
      modelName: model.modelName || '',
      provider: model.providerName || '',
      inputModalities: model.inputModalities || [],
      outputModalities: model.outputModalities || [],
      responseStreamingSupported: model.responseStreamingSupported || false,
    }));

    console.log(`Found ${models.length} models`);

    const modelsResponse: ModelsResponse = {
      success: true,
      models,
      count: models.length,
    };

    return createResponse(200, modelsResponse);

  } catch (error) {
    console.error('Error listing models:', error);
    
    return createResponse(500, {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    });
  }
};

/**
 * Create HTTP response
 */
function createResponse(statusCode: number, body: any): APIGatewayProxyResult {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    },
    body: JSON.stringify(body),
  };
}