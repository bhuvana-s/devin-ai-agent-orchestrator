import { APIGatewayProxyResult } from 'aws-lambda';

type RequestHeaders = Record<string, string | undefined> | null;

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
  body: T,
  requestHeaders?: RequestHeaders
): APIGatewayProxyResult {
  const configuredOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  const requestOrigin = Object.entries(requestHeaders || {})
    .find(([key]) => key.toLowerCase() === 'origin')?.[1];
  const allowOrigin = configuredOrigins.length === 0 || configuredOrigins.includes('*')
    ? '*'
    : requestOrigin && configuredOrigins.includes(requestOrigin)
      ? requestOrigin
      : configuredOrigins[0];

  const responseBody = body && typeof body === 'object'
    ? {
        ...(body as Record<string, any>),
        metadata: {
          timestamp: new Date().toISOString(),
          ...((body as unknown as ApiResponse).metadata || {}),
        },
      }
    : body;

  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': allowOrigin,
      'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      ...(allowOrigin === '*' ? {} : { Vary: 'Origin' }),
    },
    body: JSON.stringify(responseBody),
  };
}

/**
 * Create a success response
 */
export function successResponse<T = any>(
  data: T,
  message?: string,
  statusCode: number = 200,
  requestHeaders?: RequestHeaders
): APIGatewayProxyResult {
  return createResponse(statusCode, {
    success: true,
    data,
    message,
  }, requestHeaders);
}

/**
 * Create an error response
 */
export function errorResponse(
  error: string,
  statusCode: number = 500,
  requestHeaders?: RequestHeaders
): APIGatewayProxyResult {
  return createResponse(statusCode, {
    success: false,
    error,
  }, requestHeaders);
}

/**
 * Create a validation error response
 */
export function validationErrorResponse(
  errors: string[],
  statusCode: number = 400,
  requestHeaders?: RequestHeaders
): APIGatewayProxyResult {
  return createResponse(statusCode, {
    success: false,
    error: 'Validation failed',
    data: { errors },
  }, requestHeaders);
}