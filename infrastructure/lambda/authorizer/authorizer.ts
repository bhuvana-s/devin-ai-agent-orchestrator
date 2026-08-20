import { APIGatewayAuthorizerEvent, APIGatewayAuthorizerResult, Context } from 'aws-lambda';

interface AuthorizerContext {
  userId?: string;
  apiKey?: string;
  tier?: string;
}

/**
 * Lambda authorizer for API Gateway
 * Validates API keys and returns IAM policy
 */
export const handler = async (
  event: APIGatewayAuthorizerEvent,
  context: Context
): Promise<APIGatewayAuthorizerResult> => {
  console.log('Authorizer request:', JSON.stringify({
    requestId: context.awsRequestId,
    type: event.type,
    resource: event.methodArn,
  }));

  try {
    // Extract authorization header
    let authHeader: string | undefined;

    // Type guard for different authorizer event types
    if ('authorizationToken' in event) {
      authHeader = event.authorizationToken as string;
    } else if ('headers' in event) {
      const headers = event.headers as Record<string, string> | undefined;
      authHeader = headers?.Authorization || headers?.authorization;
    }
    
    if (!authHeader) {
      console.log('No authorization token provided');
      return generatePolicy('user', 'Deny', event.methodArn);
    }

    // Validate API key (in production, this would check against a database or secrets manager)
    const isValid = await validateApiKey(authHeader);
    
    if (!isValid) {
      console.log('Invalid API key');
      return generatePolicy('user', 'Deny', event.methodArn);
    }

    // Extract user information from token
    const userInfo = extractUserInfo(authHeader);
    
    console.log('Authorization successful for user:', userInfo.userId);
    
    return generatePolicy(userInfo.userId, 'Allow', event.methodArn, {
      userId: userInfo.userId,
      tier: userInfo.tier,
    });

  } catch (error) {
    console.error('Authorization error:', error instanceof Error ? error.message : 'Unknown error occurred');
    return generatePolicy('user', 'Deny', event.methodArn);
  }
};

/**
 * Validate API key
 * In production, this would:
 * - Check against a database
 * - Verify token signature
 * - Check expiration
 * - Validate permissions
 */
async function validateApiKey(authHeader: string): Promise<boolean> {
  try {
    // Remove "Bearer " prefix if present
    const token = authHeader.replace(/^Bearer\s+/i, '');
    
    // For demo purposes, accept any token that starts with "sk-"
    // In production, implement proper validation
    if (token.startsWith('sk-') && token.length > 10) {
      return true;
    }
    
    // Also accept basic auth for testing
    if (authHeader.startsWith('Basic ')) {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error validating API key:', error instanceof Error ? error.message : 'Unknown error occurred');
    return false;
  }
}

/**
 * Extract user information from token
 */
function extractUserInfo(authHeader: string): { userId: string; tier: string } {
  try {
    const token = authHeader.replace(/^Bearer\s+/i, '');
    
    // For demo purposes, extract user ID from token
    // In production, decode and verify JWT token
    if (token.includes('-')) {
      const parts = token.split('-');
      return {
        userId: parts[1] || 'anonymous',
        tier: parts[2] || 'free',
      };
    }
    
    return {
      userId: 'anonymous',
      tier: 'free',
    };
  } catch (error) {
    console.error('Error extracting user info:', error instanceof Error ? error.message : 'Unknown error occurred');
    return {
      userId: 'anonymous',
      tier: 'free',
    };
  }
}

/**
 * Generate IAM policy for API Gateway
 */
function generatePolicy(
  principalId: string,
  effect: 'Allow' | 'Deny',
  resource: string,
  context?: AuthorizerContext
): APIGatewayAuthorizerResult {
  const authResponse: APIGatewayAuthorizerResult = {
    principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: resource,
        },
      ],
    },
  };

  // Add context to the response
  if (context) {
    authResponse.context = {
      userId: context.userId || principalId,
      tier: context.tier || 'free',
    };
  }

  return authResponse;
}