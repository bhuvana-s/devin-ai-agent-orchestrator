#!/bin/bash

# Deployment script for AI Agent Dashboard infrastructure
# This script builds and deploys the CDK stack to AWS

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-production}
AWS_REGION=${2:-us-east-1}
AWS_PROFILE=${3:-default}

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}AI Agent Dashboard Deployment${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "Environment: ${YELLOW}${ENVIRONMENT}${NC}"
echo -e "Region: ${YELLOW}${AWS_REGION}${NC}"
echo -e "Profile: ${YELLOW}${AWS_PROFILE}${NC}"
echo ""

# Change to infrastructure directory
cd "$(dirname "$0")/.."

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}Error: AWS CLI is not installed${NC}"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed${NC}"
    exit 1
fi

# Check if CDK is installed
if ! command -v cdk &> /dev/null; then
    echo -e "${YELLOW}CDK is not installed. Installing...${NC}"
    npm install -g aws-cdk
fi

# Install dependencies
echo -e "${GREEN}Installing dependencies...${NC}"
npm install

# Build Lambda functions
echo -e "${GREEN}Building Lambda functions...${NC}"
build_lambdas() {
    cd lambda/agent-execution && npm install && npm run build && cd ../..
    cd lambda/authorizer && npm install && npm run build && cd ../..
    cd lambda/health-check && npm install && npm run build && cd ../..
    cd lambda/models && npm install && npm run build && cd ../..
    cd lambda/layers/utils && npm install && npm run build && cd ../../..
}

build_lambdas

# Bootstrap CDK (if needed)
echo -e "${GREEN}Bootstrapping CDK (if needed)...${NC}"
cdk bootstrap aws://$(aws sts get-caller-identity --query Account --output text)/${AWS_REGION} --profile ${AWS_PROFILE}

# Synthesize CloudFormation template
echo -e "${GREEN}Synthesizing CloudFormation template...${NC}"
cdk synth --profile ${AWS_PROFILE}

# Deploy stack
echo -e "${GREEN}Deploying stack...${NC}"
cdk deploy \
    --context environment=${ENVIRONMENT} \
    --profile ${AWS_PROFILE} \
    --require-approval never

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment completed successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Next steps:"
echo "1. Note the API Gateway URL from the outputs"
echo "2. Configure your frontend to use the API URL"
echo "3. Add API keys to Secrets Manager if needed"
echo "4. Test the health endpoint: curl <API_URL>/health"