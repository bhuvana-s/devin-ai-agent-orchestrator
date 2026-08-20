# Deployment Guide for AI Agent Dashboard Infrastructure

This guide provides step-by-step instructions for deploying the AI Agent Dashboard infrastructure to AWS using CDK.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Bedrock Access Setup](#bedrock-access-setup)
4. [Deployment](#deployment)
5. [Configuration](#configuration)
6. [Verification](#verification)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Tools

- **AWS Account** with appropriate IAM permissions
- **AWS CLI** (v2.x) - [Install Guide](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html)
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **AWS CDK Toolkit** - Install via npm: `npm install -g aws-cdk`
- **Git** (for cloning the repository)

### Required AWS Permissions

The AWS user/role deploying the infrastructure needs the following permissions:
- CloudFormation (full access)
- IAM (for creating roles and policies)
- Lambda (full access)
- API Gateway (full access)
- Bedrock (for model access setup)
- SSM (for parameter store)
- Secrets Manager (for secrets)
- CloudWatch (for logs and alarms)
- S3 (for CDK assets)

## Initial Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd devin-ai-agent-orchestrator
```

### 2. Configure AWS CLI

```bash
aws configure
```

You'll be prompted for:
- AWS Access Key ID
- AWS Secret Access Key
- Default region name (recommended: us-east-1)
- Default output format (json)

### 3. Verify AWS Configuration

```bash
aws sts get-caller-identity
```

This should return your account ID, ARN, and user ID.

### 4. Navigate to Infrastructure Directory

```bash
cd infrastructure
```

### 5. Install Dependencies

```bash
npm install
```

## Bedrock Access Setup

### 1. Enable Bedrock Access

Amazon Bedrock requires explicit access request for each model:

1. Go to the [Amazon Bedrock Console](https://console.aws.amazon.com/bedrock/)
2. Navigate to "Model access" in the left sidebar
3. Click "Edit" or "Request model access"
4. Select the models you want to use:
   - Amazon Titan Text Express
   - Amazon Titan Text Lite
   - Anthropic Claude v1
   - Anthropic Claude v2
5. Submit your request

Note: Model access approval may take some time (usually minutes to hours).

### 2. Verify Model Access

```bash
aws bedrock list-foundation-models --region us-east-1
```

You should see the models you requested in the output.

## Deployment

### Option 1: Automated Deployment (Recommended)

```bash
# Deploy to development environment
./scripts/deploy.sh development us-east-1 default

# Deploy to staging environment
./scripts/deploy.sh staging us-east-1 default

# Deploy to production environment
./scripts/deploy.sh production us-east-1 default
```

### Option 2: Manual Deployment

#### Step 1: Bootstrap CDK (First Time Only)

```bash
cdk bootstrap aws://$(aws sts get-caller-identity --query Account --output text)/us-east-1
```

This sets up the CDK toolkit in your AWS account.

#### Step 2: Build Lambda Functions

```bash
./scripts/build-lambdas.sh
```

Or manually:
```bash
cd lambda/agent-execution && npm install && npm run build && cd ../..
cd lambda/authorizer && npm install && npm run build && cd ../..
cd lambda/health-check && npm install && npm run build && cd ../..
cd lambda/models && npm install && npm run build && cd ../..
cd lambda/layers/utils && npm install && npm run build && cd ../../..
```

#### Step 3: Review CloudFormation Template

```bash
cdk synth
```

This generates the CloudFormation template in `cdk.out/`. Review it to understand what will be created.

#### Step 4: Deploy Stack

```bash
cdk deploy --require-approval never
```

You'll see the resources being created. This typically takes 5-10 minutes.

## Configuration

### Update Environment Variables

Edit the configuration files in `config/` directory:

- `development.json` - Development environment settings
- `staging.json` - Staging environment settings
- `production.json` - Production environment settings

### Add API Keys to Secrets Manager

After deployment, add your API keys:

```bash
# Get the secret ARN from CDK outputs
aws cloudformation describe-stacks \
  --stack-name AI-Agent-Dashboard \
  --query 'Stacks[0].Outputs' \
  --region us-east-1

# Store API keys in Secrets Manager
aws secretsmanager put-secret-value \
  --secret-id ai-agent-dashboard/production/api-secrets \
  --secret-string '{"apiKey":"your-api-key-here","otherSecret":"value"}' \
  --region us-east-1
```

### Configure Frontend

Update your Next.js frontend to use the deployed API:

```typescript
// In your frontend code
const API_URL = process.env.NEXT_PUBLIC_API_URL || '<API-GATEWAY-URL-from-outputs>';
```

## Verification

### 1. Check Stack Status

```bash
aws cloudformation describe-stacks \
  --stack-name AI-Agent-Dashboard \
  --region us-east-1
```

Status should be `CREATE_COMPLETE` or `UPDATE_COMPLETE`.

### 2. Get API Gateway URL

```bash
aws cloudformation describe-stacks \
  --stack-name AI-Agent-Dashboard \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiGatewayUrl`].OutputValue' \
  --output text \
  --region us-east-1
```

### 3. Test Health Endpoint

```bash
curl https://<API-GATEWAY-URL>/health
```

Expected response:
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

### 4. Test Models Endpoint

```bash
curl https://<API-GATEWAY-URL>/models
```

### 5. Test Agent Execution

```bash
curl -X POST https://<API-GATEWAY-URL>/agents/execute \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-test-key-123" \
  -d '{
    "agentType": "chat",
    "prompt": "Hello, how are you?",
    "modelId": "amazon.titan-text-lite-v1"
  }'
```

## Troubleshooting

### Common Issues

#### 1. CDK Bootstrap Error

**Error:** "CDK bootstrap stack not found"

**Solution:** Run the bootstrap command:
```bash
cdk bootstrap aws://<ACCOUNT-ID>/<REGION>
```

#### 2. Lambda Build Errors

**Error:** "Cannot find module" or TypeScript compilation errors

**Solution:** Ensure all dependencies are installed:
```bash
cd lambda/<function-name>
npm install
npm run build
```

#### 3. Bedrock Access Denied

**Error:** "AccessDeniedException" when calling Bedrock

**Solution:** 
- Verify model access is enabled in Bedrock console
- Check IAM role permissions in CloudFormation
- Ensure region matches where Bedrock is available

#### 4. API Gateway 401 Unauthorized

**Error:** "Unauthorized" response from API

**Solution:**
- Check authorizer Lambda logs in CloudWatch
- Verify Authorization header format: `Bearer <token>`
- For testing, use tokens starting with `sk-`

#### 5. Lambda Timeout

**Error:** "Task timed out after 15.00 seconds"

**Solution:**
- Increase timeout in CDK stack (default is 15 minutes)
- Check Bedrock model response times
- Optimize Lambda function code

### Viewing Logs

```bash
# Lambda logs
aws logs tail /aws/lambda/AI-Agent-Dashboard-Executor-production --follow

# API Gateway logs
aws logs tail /aws/apigateway/AI-Agent-Dashboard-API-production --follow

# Authorizer logs
aws logs tail /aws/lambda/AI-Agent-Dashboard-Authorizer-production --follow
```

### CloudFormation Rollback

If deployment fails, check CloudFormation events:

```bash
aws cloudformation describe-stack-events \
  --stack-name AI-Agent-Dashboard \
  --region us-east-1
```

## Cost Monitoring

### Set Up Budget Alerts

1. Go to AWS Billing Console
2. Create a budget for the AI Agent Dashboard
3. Set up email alerts for cost thresholds

### Monitor Costs

```bash
# Check CloudWatch metrics for Lambda invocations
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Invocations \
  --dimensions Name=FunctionName,Value=AI-Agent-Dashboard-Executor-production \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-02T00:00:00Z \
  --period 86400 \
  --statistics Sum
```

## Security Hardening (Optional)

For production environments, consider:

1. **Enable WAF** on API Gateway for DDoS protection
2. **Use VPC** for Lambda functions
3. **Enable X-Ray** for distributed tracing
4. **Set up SNS alerts** for CloudWatch alarms
5. **Rotate API keys** regularly
6. **Enable MFA** for AWS account

## Updates and Maintenance

### Updating Lambda Code

```bash
# 1. Make code changes
# 2. Rebuild Lambda functions
./scripts/build-lambdas.sh

# 3. Deploy changes
cdk deploy
```

### Updating Infrastructure

```bash
# 1. Make CDK stack changes
# 2. Review changes
cdk diff

# 3. Deploy
cdk deploy
```

## Cleanup

### Remove All Resources

```bash
./scripts/destroy.sh
```

Or manually:
```bash
cdk destroy --force
```

### Remove S3 Buckets (if any remain)

```bash
aws s3 ls
aws s3 rb s3://<bucket-name> --force
```

## Support and Resources

- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [Amazon Bedrock Documentation](https://docs.aws.amazon.com/bedrock/)
- [API Gateway Documentation](https://docs.aws.amazon.com/apigateway/)
- [Lambda Documentation](https://docs.aws.amazon.com/lambda/)

## Next Steps

1. Configure your frontend to use the deployed API
2. Set up CI/CD pipeline for automated deployments
3. Configure monitoring and alerting
4. Set up automated backups if needed
5. Document your specific configurations and customizations