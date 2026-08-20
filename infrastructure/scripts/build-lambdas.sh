#!/bin/bash

# Build script for Lambda functions
# This script compiles all TypeScript Lambda functions

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Building Lambda functions...${NC}"

# Change to infrastructure directory
cd "$(dirname "$0")/.."

# Function to build a Lambda
build_lambda() {
    local lambda_path=$1
    local lambda_name=$2
    
    echo -e "${YELLOW}Building ${lambda_name}...${NC}"
    cd ${lambda_path}
    
    if [ -f "package.json" ]; then
        npm install
    fi
    
    if [ -f "tsconfig.json" ]; then
        npm run build
    fi
    
    cd - > /dev/null
    echo -e "${GREEN}✓ ${lambda_name} built successfully${NC}"
}

# Build all Lambda functions
build_lambda "lambda/agent-execution" "Agent Execution"
build_lambda "lambda/authorizer" "Authorizer"
build_lambda "lambda/health-check" "Health Check"
build_lambda "lambda/models" "Models"
build_lambda "lambda/layers/utils" "Utils Layer"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}All Lambda functions built successfully!${NC}"
echo -e "${GREEN}========================================${NC}"