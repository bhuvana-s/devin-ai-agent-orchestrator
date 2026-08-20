import { Context, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

// Bedrock runtime client
const bedrockClient = new BedrockRuntimeClient({
  region: process.env.BEDROCK_REGION || 'us-east-1',
});

// Available models
const AVAILABLE_MODELS = (process.env.BEDROCK_MODELS || '').split(',');

interface AgentRequest {
  agentType: string;
  prompt: string;
  modelId?: string;
  parameters?: {
    maxTokens?: number;
    temperature?: number;
    topP?: number;
    stopSequences?: string[];
  };
  context?: Record<string, any>;
}

interface AgentResponse {
  success: boolean;
  result?: string;
  error?: string;
  metadata: {
    modelUsed: string;
    executionTime: number;
    timestamp: string;
  };
}

/**
 * Main handler for agent execution
 */
export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  const startTime = Date.now();
  
  try {
    console.log('Received event:', JSON.stringify(event, null, 2));
    
    // Parse request body
    if (!event.body) {
      return createResponse(400, {
        success: false,
        error: 'Request body is required',
      });
    }

    const request: AgentRequest = JSON.parse(event.body);
    console.log('Parsed request:', JSON.stringify(request, null, 2));

    // Validate required fields
    if (!request.agentType) {
      return createResponse(400, {
        success: false,
        error: 'agentType is required',
      });
    }

    if (!request.prompt) {
      return createResponse(400, {
        success: false,
        error: 'prompt is required',
      });
    }

    // Select model
    const modelId = request.modelId || AVAILABLE_MODELS[0];
    if (!AVAILABLE_MODELS.includes(modelId)) {
      return createResponse(400, {
        success: false,
        error: `Invalid model ID. Available models: ${AVAILABLE_MODELS.join(', ')}`,
      });
    }

    // Execute agent logic based on type
    const result = await executeAgent(request, modelId);

    const executionTime = Date.now() - startTime;

    const response: AgentResponse = {
      success: true,
      result,
      metadata: {
        modelUsed: modelId,
        executionTime,
        timestamp: new Date().toISOString(),
      },
    };

    console.log('Execution completed successfully');
    return createResponse(200, response);

  } catch (error) {
    console.error('Error executing agent:', error);
    
    const executionTime = Date.now() - startTime;
    
    return createResponse(500, {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      metadata: {
        modelUsed: 'none',
        executionTime,
        timestamp: new Date().toISOString(),
      },
    });
  }
};

/**
 * Execute agent based on type
 */
async function executeAgent(request: AgentRequest, modelId: string): Promise<string> {
  switch (request.agentType) {
    case 'chat':
      return await executeChatAgent(request, modelId);
    case 'code':
      return await executeCodeAgent(request, modelId);
    case 'analysis':
      return await executeAnalysisAgent(request, modelId);
    default:
      throw new Error(`Unknown agent type: ${request.agentType}`);
  }
}

/**
 * Execute chat agent
 */
async function executeChatAgent(request: AgentRequest, modelId: string): Promise<string> {
  const parameters = {
    maxTokens: request.parameters?.maxTokens || 1000,
    temperature: request.parameters?.temperature || 0.7,
    topP: request.parameters?.topP || 0.9,
    stopSequences: request.parameters?.stopSequences,
  };

  const command = new InvokeModelCommand({
    modelId,
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify({
      inputText: request.prompt,
      textGenerationConfig: parameters,
    }),
  });

  const response = await bedrockClient.send(command);
  const responseBody = JSON.parse(new TextDecoder().decode(response.body));
  
  return responseBody.outputText || responseBody.results?.[0]?.outputText || 'No response generated';
}

/**
 * Execute code generation agent
 */
async function executeCodeAgent(request: AgentRequest, modelId: string): Promise<string> {
  const codePrompt = `You are a code generation assistant. Generate clean, well-commented code for the following request:\n\n${request.prompt}\n\nProvide only the code with minimal explanation.`;
  
  const parameters = {
    maxTokens: request.parameters?.maxTokens || 2000,
    temperature: request.parameters?.temperature || 0.3, // Lower temperature for more deterministic code
    topP: request.parameters?.topP || 0.95,
  };

  const command = new InvokeModelCommand({
    modelId,
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify({
      inputText: codePrompt,
      textGenerationConfig: parameters,
    }),
  });

  const response = await bedrockClient.send(command);
  const responseBody = JSON.parse(new TextDecoder().decode(response.body));
  
  return responseBody.outputText || responseBody.results?.[0]?.outputText || 'No code generated';
}

/**
 * Execute analysis agent
 */
async function executeAnalysisAgent(request: AgentRequest, modelId: string): Promise<string> {
  const analysisPrompt = `Analyze the following and provide detailed insights:\n\n${request.prompt}\n\nProvide a structured analysis with key findings, recommendations, and potential risks.`;
  
  const parameters = {
    maxTokens: request.parameters?.maxTokens || 1500,
    temperature: request.parameters?.temperature || 0.5,
    topP: request.parameters?.topP || 0.9,
  };

  const command = new InvokeModelCommand({
    modelId,
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify({
      inputText: analysisPrompt,
      textGenerationConfig: parameters,
    }),
  });

  const response = await bedrockClient.send(command);
  const responseBody = JSON.parse(new TextDecoder().decode(response.body));
  
  return responseBody.outputText || responseBody.results?.[0]?.outputText || 'No analysis generated';
}

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