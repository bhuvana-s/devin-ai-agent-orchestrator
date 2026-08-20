# AI Agent Orchestrator Dashboard

A modern, glassmorphism-styled AI agent orchestration dashboard with real AWS Bedrock integration.

## 🚀 Features

- **Visual Workflow Builder**: Drag-and-drop agent orchestration with React Flow
- **Real AWS Execution**: Execute workflows on AWS Bedrock infrastructure
- **Multiple Agent Types**: Chat, Code, Analysis, Analyzer, Summarizer, Validator
- **Custom Agent Creation**: Build and configure custom agent types
- **Configuration Management**: AWS credentials and model configuration
- **Execution Modes**: Simulation vs Real AWS execution with error alerting
- **Modern UI**: Glassmorphism design with animations and micro-interactions

## 🏗️ Architecture

### Frontend
- **Framework**: Next.js 16 with TypeScript
- **UI Components**: React Flow for workflow visualization
- **State Management**: Zustand
- **Styling**: Tailwind CSS with custom glassmorphism tokens
- **Animations**: Framer Motion

### Backend (AWS Infrastructure)
- **API Gateway**: RESTful API endpoints
- **Lambda Functions**: 
  - Agent Execution Handler
  - Authorizer (JWT/Token based)
  - Health Check
  - Models Endpoint
- **AWS Bedrock**: AI model integration (Llama, Claude, Mistral, DeepSeek)
- **CDK**: Infrastructure as Code

## 📋 Prerequisites

- Node.js 18+ 
- AWS CLI configured with credentials
- AWS Bedrock model access enabled
- AWS CDK CLI installed

## 🔧 Installation

```bash
# Clone the repository
git clone https://github.com/bhuvana-s/devin-ai-agent-orchestrator.git
cd devin-ai-agent-orchestrator

# Install dependencies
npm install
```

## 🚀 Local Development

```bash
# Run the development server
npm run dev

# Open http://localhost:3000
```

## ☁️ AWS Infrastructure Deployment

### Deploy Backend Infrastructure

```bash
cd infrastructure

# Build Lambda functions
./scripts/build-lambdas.sh

# Deploy to AWS
cdk deploy --require-approval never
```

### Deployed Infrastructure Details

**Lambda Function Name:**
```
AI-Agent-Dashboard-Executor-production
```

**API Gateway URL:**
```
https://rkx19twzgk.execute-api.us-east-1.amazonaws.com/production/
```

**AWS Region:**
```
us-east-1
```

## ⚙️ Configuration

### AWS Configuration

Navigate to **Settings** in the dashboard and configure:

- **AWS Access Key ID**: Your AWS access key
- **AWS Secret Access Key**: Your AWS secret key  
- **API URL**: `https://rkx19twzgk.execute-api.us-east-1.amazonaws.com/production/`
- **Model ID**: `meta.llama3-8b-instruct-v1:0` (or other available models)
- **Region**: `us-east-1`

### Execution Mode

- **Simulation Mode**: Local mock execution (default)
- **Real AWS Mode**: Execute on deployed AWS infrastructure

### Available Models

- **Meta Llama 3**: `meta.llama3-8b-instruct-v1:0`, `meta.llama3-70b-instruct-v1:0`
- **Anthropic Claude**: `anthropic.claude-haiku-4-5-20251001-v1:0`, `anthropic.claude-sonnet-4-20250514-v1:0`
- **Mistral**: `mistral.mistral-7b-instruct-v0:2`, `mistral.mixtral-8x7b-instruct-v0:1`
- **DeepSeek**: `deepseek.r1-v1:0`

## 🧪 Testing

### Test Real AWS Execution

```bash
curl -X POST https://rkx19twzgk.execute-api.us-east-1.amazonaws.com/production/agents/execute \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-test-key" \
  -d '{
    "agentType": "validator",
    "prompt": "Validate this code",
    "modelId": "meta.llama3-8b-instruct-v1:0"
  }'
```

### Health Check

```bash
curl https://rkx19twzgk.execute-api.us-east-1.amazonaws.com/production/health
```

### Get Available Models

```bash
curl https://rkx19twzgk.execute-api.us-east-1.amazonaws.com/production/models
```

## 🛠️ Development

### Project Structure

```
├── src/
│   ├── app/                    # Next.js app directory
│   ├── components/            # React components
│   │   ├── canvas/           # React Flow components
│   │   ├── layout/           # Layout components
│   │   ├── nodes/            # Agent node components
│   │   └── panels/           # Panel components
│   ├── lib/
│   │   ├── config/           # Configuration and execution service
│   │   ├── store.ts          # Zustand state management
│   │   └── custom-agent-icons.ts
└── infrastructure/
    ├── lambda/               # AWS Lambda functions
    │   ├── agent-execution/
    │   ├── authorizer/
    │   ├── health-check/
    │   └── models/
    └── lib/                  # CDK stack definitions
```

### Building

```bash
npm run build
```

### Type Checking

```bash
npm run type-check
```

## 🔒 Security

- AWS credentials are stored in browser localStorage (development only)
- In production, use AWS Secrets Manager or environment variables
- API Gateway protected by Lambda authorizer
- Bedrock IAM role with least privilege permissions

## 📊 Monitoring

### CloudWatch Logs

```bash
# View Lambda execution logs
aws logs tail /aws/lambda/AI-Agent-Dashboard-Executor-production --follow --region us-east-1

# Filter recent logs
aws logs filter-log-events \
  --log-group-name /aws/lambda/AI-Agent-Dashboard-Executor-production \
  --region us-east-1 \
  --start-time $(date -v-5M +%s)000
```

## 🚨 Error Handling

### Real AWS Execution Errors

In real execution mode, errors trigger:
- 🚨 **Browser Alert**: Immediate popup with error details
- 🛑 **Execution Stop**: Workflow stops immediately (no fallback to simulation)
- 📋 **Clear Logging**: "REAL AWS MODE - Execution stopped due to error"
- 🔍 **Troubleshooting**: Steps to check AWS credentials, API URL, and Bedrock access

## 🔄 Updating Infrastructure

```bash
cd infrastructure

# Modify CDK stack or Lambda code
./scripts/build-lambdas.sh
cdk deploy --require-approval never
```

## 📝 Agent Types

| Agent Type | Description | Use Case |
|------------|-------------|----------|
| `chat` | General conversation | Q&A, assistance |
| `code` | Code generation | Programming tasks |
| `analysis` | Data analysis | Insights, recommendations |
| `analyzer` | Deep analysis (maps to analysis) | Detailed examination |
| `summarizer` | Content summarization | Document summaries |
| `validator` | Code/data validation | Quality checks |

## 🐛 Troubleshooting

### Common Issues

**"Unknown agent type" error:**
- Ensure Lambda function is updated with latest code
- Check `agent-execution.ts` has all agent types in switch statement

**"Model access not enabled" error:**
- Enable Bedrock model access in AWS Console
- Navigate to Amazon Bedrock → Model access → Enable models

**"No response generated" error:**
- Check CloudWatch logs for actual Bedrock response
- Verify response parsing matches model format
- Ensure model ID matches available models

**Authentication errors:**
- Verify AWS credentials in Settings
- Check API Gateway authorizer configuration
- Ensure authorization header format: `Bearer sk-test-key`

## 📈 Performance

- **Lambda Cold Start**: ~300ms
- **Bedrock API Call**: 5-15 seconds (varies by model and prompt)
- **Total Execution**: 6-20 seconds per agent

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- AWS Bedrock for AI model integration
- React Flow for workflow visualization
- Framer Motion for animations
- Tailwind CSS for styling