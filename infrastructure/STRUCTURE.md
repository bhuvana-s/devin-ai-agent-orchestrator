# Infrastructure Structure Overview

This document provides a comprehensive overview of the AI Agent Dashboard infrastructure structure.

## Directory Structure

```
infrastructure/
├── bin/
│   └── app.ts                          # CDK application entry point
├── lib/
│   └── ai-agent-dashboard-stack.ts     # Main CDK stack definition
├── lambda/                             # Lambda function source code
│   ├── agent-execution/                # Agent execution Lambda
│   │   ├── agent-execution.ts          # Main handler code
│   │   ├── package.json                # Dependencies
│   │   └── tsconfig.json               # TypeScript config
│   ├── authorizer/                     # API authorizer Lambda
│   │   ├── authorizer.ts               # Authorization logic
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── health-check/                   # Health check Lambda
│   │   ├── health-check.ts             # Health monitoring
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── models/                         # Models list Lambda
│   │   ├── models.ts                   # Bedrock models listing
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── layers/                         # Lambda layers
│       └── utils/                      # Shared utilities
│           ├── logger.ts               # Logging utility
│           ├── response.ts             # HTTP response helpers
│           ├── index.ts                # Layer exports
│           ├── package.json
│           └── tsconfig.json
├── config/                             # Environment configurations
│   ├── development.json                # Development settings
│   ├── staging.json                    # Staging settings
│   └── production.json                 # Production settings
├── scripts/                            # Deployment and utility scripts
│   ├── deploy.sh                       # Deployment script
│   ├── destroy.sh                      # Destruction script
│   └── build-lambdas.sh                # Lambda build script
├── cdk.json                            # CDK configuration
├── package.json                        # Node.js dependencies
├── tsconfig.json                       # TypeScript configuration
├── .gitignore                          # Git ignore rules
├── README.md                           # Main documentation
├── DEPLOYMENT.md                       # Deployment guide
├── SECURITY.md                         # Security documentation
├── COST.md                             # Cost analysis
├── QUICKSTART.md                       # Quick start guide
└── STRUCTURE.md                        # This file
```

## Component Details

### 1. CDK Application (`bin/app.ts`)

**Purpose:** Entry point for the CDK application

**Key Features:**
- Environment configuration (account, region)
- Stack instantiation
- Tag configuration for cost tracking

**Configuration:**
- Account: Auto-detected from AWS CLI or environment variable
- Region: Auto-detected or specified (default: us-east-1)
- Tags: Project, Environment, ManagedBy, CostCenter

### 2. Main CDK Stack (`lib/ai-agent-dashboard-stack.ts`)

**Purpose:** Defines all AWS resources for the infrastructure

**Resources Created:**

#### SSM Parameters
- Bedrock region configuration
- Available Bedrock models list

#### Secrets Manager
- API secrets storage
- Automatic encryption with AWS KMS

#### IAM Roles
- Bedrock access role with least privilege
- Policies for Bedrock, CloudWatch, SSM, Secrets Manager

#### Lambda Functions
- **Agent Execution Lambda**: Main agent logic with Bedrock integration
- **Authorizer Lambda**: API key validation
- **Health Check Lambda**: System health monitoring
- **Models Lambda**: Available models listing

#### Lambda Layer
- **Utils Layer**: Shared utilities (logger, response helpers)

#### API Gateway
- REST API with CORS enabled
- Custom authorizer
- Three main endpoints:
  - `POST /agents/execute` - Execute agent workflows
  - `GET /health` - Health check
  - `GET /models` - List available models
- Throttling and rate limiting
- CloudWatch logging and metrics

#### CloudWatch Alarms
- Lambda error rate monitoring
- API latency monitoring

### 3. Lambda Functions

#### Agent Execution Lambda (`lambda/agent-execution/`)

**Purpose:** Execute AI agent workflows using Amazon Bedrock

**Features:**
- Support for multiple agent types (chat, code, analysis)
- Model selection and configuration
- Request validation and error handling
- Structured logging

**Handler:** `agent-execution.handler`

**Environment Variables:**
- `ENVIRONMENT`: Current environment
- `BEDROCK_REGION`: AWS region for Bedrock
- `BEDROCK_MODELS`: Available model IDs
- `LOG_LEVEL`: Logging level

**Dependencies:**
- `@aws-sdk/client-bedrock-runtime`: Bedrock SDK

#### Authorizer Lambda (`lambda/authorizer/`)

**Purpose:** Validate API keys and generate IAM policies

**Features:**
- API key validation
- User information extraction
- IAM policy generation
- Error handling

**Handler:** `authorizer.handler`

**Dependencies:** None (minimal for security)

#### Health Check Lambda (`lambda/health-check/`)

**Purpose:** Monitor system health and status

**Features:**
- Lambda health check
- Bedrock access verification
- Memory usage monitoring
- Status aggregation

**Handler:** `health-check.handler`

**Dependencies:** None

#### Models Lambda (`lambda/models/`)

**Purpose:** List available Bedrock models

**Features:**
- Bedrock model listing
- Model information formatting
- Error handling

**Handler:** `models.handler`

**Dependencies:**
- `@aws-sdk/client-bedrock`: Bedrock SDK

### 4. Lambda Layer

#### Utils Layer (`lambda/layers/utils/`)

**Purpose:** Shared utilities for all Lambda functions

**Components:**
- **Logger**: Structured logging with levels
- **Response**: Standardized HTTP response helpers

**Exports:**
```typescript
export { Logger } from './logger';
export {
  createResponse,
  successResponse,
  errorResponse,
  validationErrorResponse,
  ApiResponse,
} from './response';
```

### 5. Configuration Files

#### Development Config (`config/development.json`)
- Minimal resource allocation
- Single model (Titan Lite)
- Short log retention (3 days)
- Low rate limits

#### Staging Config (`config/staging.json`)
- Moderate resource allocation
- Multiple models
- Medium log retention (7 days)
- Medium rate limits

#### Production Config (`config/production.json`)
- Full resource allocation
- All available models
- Extended log retention (30 days)
- High rate limits
- Cost center tagging

### 6. Deployment Scripts

#### Deploy Script (`scripts/deploy.sh`)
- Installs dependencies
- Builds Lambda functions
- Bootstraps CDK (if needed)
- Synthesizes CloudFormation template
- Deploys stack

#### Destroy Script (`scripts/destroy.sh`)
- Confirms destruction
- Destroys CDK stack
- Cleans up resources

#### Build Lambdas Script (`scripts/build-lambdas.sh`)
- Builds all Lambda functions
- Compiles TypeScript
- Installs dependencies

## AWS Resource Mapping

| Resource Type | Resource Name | Purpose |
|--------------|---------------|---------|
| Lambda Function | AI-Agent-Dashboard-Executor-{env} | Agent execution |
| Lambda Function | AI-Agent-Dashboard-Authorizer-{env} | API authorization |
| Lambda Function | AI-Agent-Dashboard-Health-{env} | Health monitoring |
| Lambda Function | AI-Agent-Dashboard-Models-{env} | Model listing |
| Lambda Layer | UtilsLayer | Shared utilities |
| API Gateway | AI-Agent-Dashboard-API-{env} | REST API |
| IAM Role | AI-Agent-Dashboard-Bedrock-Role-{env} | Bedrock access |
| SSM Parameter | /ai-agent-dashboard/{env}/bedrock-region | Bedrock region |
| SSM Parameter | /ai-agent-dashboard/{env}/bedrock-models | Available models |
| Secrets Manager | ai-agent-dashboard/{env}/api-secrets | API keys |
| CloudWatch Log Group | /aws/lambda/AI-Agent-Dashboard-* | Lambda logs |
| CloudWatch Alarm | LambdaErrorAlarm | Error monitoring |
| CloudWatch Alarm | ApiLatencyAlarm | Latency monitoring |

## API Endpoints

### Base URL
```
https://<api-id>.execute-api.<region>.amazonaws.com/<environment>
```

### Endpoints

#### POST /agents/execute
Execute an AI agent workflow

**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer <api-key>`

**Body:**
```json
{
  "agentType": "chat|code|analysis",
  "prompt": "string",
  "modelId": "string",
  "parameters": {
    "maxTokens": number,
    "temperature": number,
    "topP": number
  },
  "context": {}
}
```

#### GET /health
Health check endpoint

**Response:**
```json
{
  "status": "healthy|degraded|unhealthy",
  "timestamp": "ISO8601",
  "environment": "string",
  "checks": {
    "lambda": boolean,
    "bedrock": boolean,
    "memory": boolean
  }
}
```

#### GET /models
List available Bedrock models

**Response:**
```json
{
  "success": true,
  "models": [
    {
      "modelId": "string",
      "modelName": "string",
      "provider": "string",
      "inputModalities": ["string"],
      "outputModalities": ["string"],
      "responseStreamingSupported": boolean
    }
  ],
  "count": number
}
```

## Security Architecture

### Authentication Flow
```
Client Request → API Gateway → Authorizer Lambda → (if valid) → Target Lambda
```

### Authorization Flow
```
Authorizer validates API key → Generates IAM policy → API Gateway enforces policy
```

### IAM Hierarchy
```
Bedrock Access Role
├── Bedrock Access Policy (specific models only)
├── CloudWatch Logs Policy
├── SSM Read Policy (specific parameters)
└── Secrets Manager Read Policy (specific secrets)
```

## Monitoring and Observability

### CloudWatch Metrics
- Lambda invocations and errors
- API Gateway latency and 4XX/5XX errors
- Bedrock invocation metrics

### CloudWatch Logs
- Lambda function logs
- API Gateway access logs
- Authorizer logs

### CloudWatch Alarms
- Lambda error rate > 5 errors
- API latency > 10 seconds

## Cost Considerations

### Primary Cost Drivers
1. **Bedrock**: Token usage (variable)
2. **Lambda**: Compute time and requests
3. **API Gateway**: Request count and data transfer
4. **CloudWatch**: Log volume and metrics

### Cost Optimization Features
- Right-sized Lambda memory per environment
- Appropriate log retention periods
- Rate limiting on API Gateway
- Model selection strategy

## Deployment Workflow

```
1. Configure environment variables
2. Install dependencies (npm install)
3. Build Lambda functions (./scripts/build-lambdas.sh)
4. Bootstrap CDK (first time only)
5. Deploy stack (cdk deploy)
6. Verify deployment (test endpoints)
7. Configure frontend (update API URL)
```

## Environment Promotion

```
Development → Staging → Production
```

Each environment has:
- Separate AWS resources
- Isolated configuration
- Appropriate resource allocation
- Environment-specific tagging

## Disaster Recovery

### Backup Strategy
- Infrastructure as Code (CDK)
- Configuration in Git
- Secrets in Secrets Manager
- Parameters in SSM Parameter Store

### Recovery Process
1. Deploy infrastructure from CDK
2. Restore secrets from backup
3. Update configuration
4. Test all endpoints

## Maintenance

### Regular Tasks
- Review IAM permissions
- Update Lambda dependencies
- Monitor costs
- Review logs for issues
- Update documentation

### Update Process
1. Make code changes
2. Update configuration if needed
3. Build Lambda functions
4. Run `cdk diff` to review changes
5. Deploy with `cdk deploy`

---

This structure provides a complete, production-ready infrastructure for the AI Agent Dashboard with proper separation of concerns, security, monitoring, and cost optimization.