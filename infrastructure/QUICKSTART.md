# Quick Start Guide - AI Agent Dashboard Infrastructure

This guide will help you get the AI Agent Dashboard infrastructure deployed to AWS in under 30 minutes.

## Prerequisites (5 minutes)

1. **AWS Account** with appropriate permissions
2. **AWS CLI** installed and configured:
   ```bash
   aws configure
   ```
3. **Node.js** (v18+) installed
4. **AWS CDK** installed globally:
   ```bash
   npm install -g aws-cdk
   ```

## Enable Bedrock Access (2 minutes)

1. Go to [Amazon Bedrock Console](https://console.aws.amazon.com/bedrock/)
2. Navigate to "Model access"
3. Click "Edit" and select:
   - Amazon Titan Text Express
   - Amazon Titan Text Lite
   - Anthropic Claude v1 (optional)
4. Submit request

## Deploy Infrastructure (10 minutes)

```bash
# Navigate to infrastructure directory
cd infrastructure

# Install dependencies
npm install

# Build Lambda functions
./scripts/build-lambdas.sh

# Bootstrap CDK (first time only)
cdk bootstrap aws://$(aws sts get-caller-identity --query Account --output text)/us-east-1

# Deploy to development environment
./scripts/deploy.sh development us-east-1 default
```

## Get API URL (1 minute)

```bash
aws cloudformation describe-stacks \
  --stack-name AI-Agent-Dashboard \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiGatewayUrl`].OutputValue' \
  --output text \
  --region us-east-1
```

## Test Deployment (2 minutes)

```bash
# Test health endpoint
curl https://<YOUR-API-URL>/health

# Test models endpoint
curl https://<YOUR-API-URL>/models

# Test agent execution
curl -X POST https://<YOUR-API-URL>/agents/execute \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-test-key" \
  -d '{
    "agentType": "chat",
    "prompt": "Hello, how are you?",
    "modelId": "amazon.titan-text-lite-v1"
  }'
```

## Configure Frontend (5 minutes)

Add to your Next.js `.env.local`:
```bash
NEXT_PUBLIC_API_URL=https://<YOUR-API-URL>
```

Update your frontend code to use the API:
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function executeAgent(prompt: string) {
  const response = await fetch(`${API_URL}/agents/execute`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer sk-test-key',
    },
    body: JSON.stringify({
      agentType: 'chat',
      prompt,
      modelId: 'amazon.titan-text-lite-v1',
    }),
  });
  
  return response.json();
}
```

## Cleanup (if needed)

```bash
cd infrastructure
./scripts/destroy.sh
```

## Next Steps

1. 📖 Read the full [README.md](./README.md) for detailed documentation
2. 🚀 Review [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment
3. 🔒 Review [SECURITY.md](./SECURITY.md) for security considerations
4. 💰 Review [COST.md](./COST.md) for cost optimization
5. ⚙️ Configure environment-specific settings in `config/` directory

## Troubleshooting

### Bedrock Access Denied
- Wait for model access approval (can take 15-30 minutes)
- Verify model access in Bedrock console

### CDK Bootstrap Error
```bash
cdk bootstrap aws://<ACCOUNT-ID>/us-east-1
```

### Lambda Build Errors
```bash
cd lambda/<function-name>
npm install
npm run build
```

### API Returns 401 Unauthorized
- Ensure Authorization header is present
- Use token format: `Bearer sk-<token>`

## Support

For detailed documentation and troubleshooting, see:
- [Full Documentation](./README.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Security Guide](./SECURITY.md)

## Architecture Overview

```
Next.js Frontend → API Gateway → Lambda Functions → Amazon Bedrock
```

**Components:**
- API Gateway: REST API with authentication
- Lambda Functions: Agent execution, authorizer, health check, models
- Amazon Bedrock: AI model inference
- CloudWatch: Monitoring and logging

**Estimated Monthly Cost:**
- Development: ~$100/month
- Staging: ~$300/month
- Production: ~$1,500-2,000/month (varies with usage)

---

**You're all set!** Your AI Agent Dashboard infrastructure is now deployed and ready to use. 🎉