# AI Agent Dashboard - AWS Infrastructure

This directory contains the AWS CDK (Cloud Development Kit) infrastructure for the AI Agent Dashboard. The infrastructure includes Amazon Bedrock integration, API Gateway, Lambda functions, and supporting services.

## Architecture Overview

```
┌─────────────────┐
│   Next.js App   │
│   (Frontend)    │
└────────┬────────┘
         │
         │ HTTP/HTTPS
         ▼
┌─────────────────┐
│  API Gateway    │
│  (REST API)     │
└────────┬────────┘
         │
         ├─────────────┬──────────────┬─────────────┐
         ▼             ▼              ▼             ▼
┌─────────────┐ ┌──────────┐ ┌────────────┐ ┌──────────┐
│   Agent     │ │          │ │   Health   │ │  Models  │
│ Execution   │ │Authorizer│ │   Check    │ │  List    │
│   Lambda    │ │ Lambda   │ │  Lambda    │ │  Lambda  │
└──────┬──────┘ └──────────┘ └────────────┘ └──────────┘
       │
       ▼
┌─────────────────┐
│  Amazon         │
│  Bedrock        │
│  (AI Models)    │
└─────────────────┘
```

## Components

### 1. Amazon Bedrock Integration
- IAM roles with least privilege access to Bedrock models
- Support for multiple Titan Text and Claude models
- Model configuration via AWS Systems Manager Parameter Store

### 2. API Gateway
- REST API with CORS enabled
- Custom Lambda authorizer for API key validation
- Multiple endpoints:
  - `POST /agents/execute` - Execute AI agent workflows
  - `GET /health` - Health check endpoint
  - `GET /models` - List available Bedrock models
- Throttling and rate limiting
- CloudWatch logging and metrics

### 3. Lambda Functions
- **Agent Execution Lambda**: Main function for executing AI agent workflows with Bedrock
- **Authorizer Lambda**: Custom authorizer for API key validation
- **Health Check Lambda**: Monitoring and health status endpoint
- **Models Lambda**: Lists available Bedrock models
- **Utils Layer**: Shared utilities (logger, response helpers)

### 4. Security & Compliance
- IAM roles following least privilege principle
- Secrets Manager for API keys and sensitive data
- SSM Parameter Store for configuration
- CloudWatch Logs for audit trails
- Security best practices implemented

### 5. Monitoring & Observability
- CloudWatch Alarms for Lambda errors and API latency
- Structured logging with correlation IDs
- Metrics collection and dashboards
- Health check endpoint for monitoring

## Prerequisites

1. **AWS Account** with appropriate permissions
2. **AWS CLI** installed and configured
3. **Node.js** (v18 or higher)
4. **AWS CDK Toolkit** installed globally
5. **Bedrock Access** - Request access to Amazon Bedrock models in your AWS account

### Installation

```bash
# Install AWS CDK globally
npm install -g aws-cdk

# Configure AWS CLI
aws configure

# Bootstrap CDK in your account (first time only)
cdk bootstrap aws://<ACCOUNT-ID>/<REGION>
```

## Project Structure

```
infrastructure/
├── bin/
│   └── app.ts                          # CDK app entry point
├── lib/
│   └── ai-agent-dashboard-stack.ts     # Main CDK stack
├── lambda/
│   ├── agent-execution/                # Agent execution function
│   │   ├── agent-execution.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── authorizer/                     # API authorizer
│   │   ├── authorizer.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── health-check/                   # Health check function
│   │   ├── health-check.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── models/                         # Models list function
│   │   ├── models.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── layers/
│       └── utils/                      # Shared utilities layer
│           ├── logger.ts
│           ├── response.ts
│           ├── index.ts
│           └── package.json
├── config/
│   ├── development.json                # Development config
│   ├── staging.json                    # Staging config
│   └── production.json                 # Production config
├── scripts/
│   ├── deploy.sh                       # Deployment script
│   ├── destroy.sh                      # Destruction script
│   └── build-lambdas.sh                # Lambda build script
├── cdk.json                            # CDK configuration
├── package.json                        # Node.js dependencies
├── tsconfig.json                       # TypeScript configuration
└── README.md                           # This file
```

## Deployment

### Quick Start

```bash
# Navigate to infrastructure directory
cd infrastructure

# Install dependencies
npm install

# Build Lambda functions
./scripts/build-lambdas.sh

# Deploy to AWS (development environment by default)
./scripts/deploy.sh development us-east-1 default
```

### Manual Deployment

```bash
# Install dependencies
npm install

# Build Lambda functions
cd lambda/agent-execution && npm install && npm run build && cd ../..
cd lambda/authorizer && npm install && npm run build && cd ../..
cd lambda/health-check && npm install && npm run build && cd ../..
cd lambda/models && npm install && npm run build && cd ../..
cd lambda/layers/utils && npm install && npm run build && cd ../../..

# Synthesize CloudFormation template
cdk synth

# Deploy stack
cdk deploy --require-approval never
```

### Environment-Specific Deployment

```bash
# Development
./scripts/deploy.sh development us-east-1 default

# Staging
./scripts/deploy.sh staging us-east-1 default

# Production
./scripts/deploy.sh production us-east-1 default
```

## Configuration

### Environment Variables

The Lambda functions use the following environment variables:

- `ENVIRONMENT` - Environment name (development, staging, production)
- `BEDROCK_REGION` - AWS region for Bedrock service
- `BEDROCK_MODELS` - Comma-separated list of available model IDs
- `LOG_LEVEL` - Logging level (DEBUG, INFO, WARN, ERROR)

### AWS Systems Manager Parameters

Configuration is stored in SSM Parameter Store:

- `/ai-agent-dashboard/{environment}/bedrock-region` - Bedrock region
- `/ai-agent-dashboard/{environment}/bedrock-models` - Available models

### AWS Secrets Manager

Sensitive data is stored in Secrets Manager:

- `ai-agent-dashboard/{environment}/api-secrets` - API keys and secrets

## API Endpoints

After deployment, the API Gateway provides the following endpoints:

### POST /agents/execute
Execute an AI agent workflow.

**Request:**
```json
{
  "agentType": "chat|code|analysis",
  "prompt": "Your prompt here",
  "modelId": "amazon.titan-text-express-v1",
  "parameters": {
    "maxTokens": 1000,
    "temperature": 0.7,
    "topP": 0.9
  },
  "context": {}
}
```

**Response:**
```json
{
  "success": true,
  "result": "Generated response",
  "metadata": {
    "modelUsed": "amazon.titan-text-express-v1",
    "executionTime": 1500,
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### GET /health
Health check endpoint for monitoring.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "environment": "production",
  "checks": {
    "lambda": true,
    "bedrock": true,
    "memory": true
  }
}
```

### GET /models
List available Bedrock models.

**Response:**
```json
{
  "success": true,
  "models": [
    {
      "modelId": "amazon.titan-text-express-v1",
      "modelName": "Titan Text Express",
      "provider": "Amazon",
      "inputModalities": ["TEXT"],
      "outputModalities": ["TEXT"],
      "responseStreamingSupported": true
    }
  ],
  "count": 4
}
```

## Cost Optimization

The infrastructure implements several cost optimization strategies:

1. **Lambda Memory Configuration**: Right-sized based on environment
2. **Log Retention**: Shorter retention for development (3 days) vs production (30 days)
3. **API Throttling**: Rate limiting to prevent cost overruns
4. **Bedrock Model Selection**: Use cost-effective models when appropriate
5. **CloudWatch Alarms**: Monitor and alert on unusual usage patterns

## Security Best Practices

1. **Least Privilege IAM**: IAM roles have minimal required permissions
2. **Secrets Management**: Sensitive data stored in Secrets Manager
3. **API Authentication**: Custom authorizer for API key validation
4. **Encryption**: All data encrypted at rest and in transit
5. **VPC Configuration**: Lambda functions can be configured for VPC isolation
6. **Audit Logging**: CloudWatch Logs for all API and Lambda invocations

## Monitoring & Troubleshooting

### CloudWatch Metrics

Monitor these key metrics:
- Lambda invocation count and error rate
- API Gateway latency and 4XX/5XX errors
- Bedrock invocation metrics
- CloudWatch Alarm status

### Common Issues

**Lambda Timeout Errors**
- Increase timeout in CDK stack configuration
- Optimize Lambda function code
- Check Bedrock model response times

**Bedrock Access Denied**
- Verify IAM role permissions
- Ensure Bedrock model access is enabled in AWS account
- Check region configuration

**API Gateway Throttling**
- Adjust throttling limits in CDK stack
- Implement client-side rate limiting
- Use API keys for better control

## Cleanup

To remove all AWS resources:

```bash
# Using the destroy script
./scripts/destroy.sh

# Or manually
cdk destroy --force
```

## Development

### Adding New Lambda Functions

1. Create function directory in `lambda/`
2. Add TypeScript code and package.json
3. Update CDK stack to reference new function
4. Add to `build-lambdas.sh` script

### Modifying Infrastructure

1. Make changes to CDK stack in `lib/`
2. Run `cdk diff` to see changes
3. Run `cdk deploy` to apply changes

### Testing Locally

```bash
# Build Lambda functions
./scripts/build-lambdas.sh

# Synthesize to review CloudFormation template
cdk synth

# Diff to see changes
cdk diff
```

## Support

For issues or questions:
- Check CloudWatch Logs for error details
- Review IAM role permissions
- Verify Bedrock model access in AWS console
- Check API Gateway logs for request/response details

## License

ISC