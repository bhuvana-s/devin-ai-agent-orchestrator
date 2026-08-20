import { APIGatewayProxyResult } from 'aws-lambda';

/**
 * Standard API response structure
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  metadata?: {
    timestamp: string;
    requestId?: string;
  };
}

/**
 * Create a standardized API response
 */
export function createResponse<T = any>(
  statusCode: number,
  body: ApiResponse<T>
): APIGatewayProxyResult {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    },
    body: JSON.stringify({
      ...body,
      metadata: {
        timestamp: new Date().toISOString(),
        ...body.metadata,
      },
    }),
  };
}

/**
 * Create a success response
 */
export function successResponse<T = any>(
  data: T,
  message?: string,
  statusCode: number = 200
): APIGatewayProxyResult {
  return createResponse(statusCode, {
    success: true,
    data,
    message,
  });
}

/**
 * Create an error response
 */
export function errorResponse(
  error: string,
  statusCode: number = 500
): APIGatewayProxyResult {
  return createResponse(statusCode, {
    success: false,
    error,
  });
}

/**
 * Create a validation error response
 */
export function validationErrorResponse(
  errors: string[],
  statusCode: number = 400
): APIGatewayProxyResult {
  return createResponse(statusCode, {
    success: false,
    error: 'Validation failed',
    data: { errors },
  });
}