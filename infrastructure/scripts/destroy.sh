#!/bin/bash

# Destroy script for AI Agent Dashboard infrastructure
# This script destroys the CDK stack from AWS

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
AWS_PROFILE=${1:-default}

echo -e "${RED}========================================${NC}"
echo -e "${RED}AI Agent Dashboard Destruction${NC}"
echo -e "${RED}========================================${NC}"
echo -e "Profile: ${YELLOW}${AWS_PROFILE}${NC}"
echo ""

# Change to infrastructure directory
cd "$(dirname "$0")/.."

# Warning prompt
echo -e "${YELLOW}WARNING: This will destroy all AWS resources created by the CDK stack.${NC}"
echo -e "${YELLOW}This action cannot be undone!${NC}"
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo -e "${GREEN}Destruction cancelled.${NC}"
    exit 0
fi

# Destroy stack
echo -e "${RED}Destroying stack...${NC}"
cdk destroy --profile ${AWS_PROFILE} --force

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Destruction completed successfully!${NC}"
echo -e "${GREEN}========================================${NC}"