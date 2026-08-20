#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AiAgentDashboardStack } from '../lib/ai-agent-dashboard-stack';

const app = new cdk.App();

// Environment configuration
const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT || process.env.AWS_ACCOUNT_ID,
  region: process.env.CDK_DEFAULT_REGION || process.env.AWS_REGION || 'us-east-1',
};

new AiAgentDashboardStack(app, 'AiAgentDashboardStack', {
  env,
  description: 'AWS infrastructure for AI Agent Dashboard with Bedrock integration',
  
  // Stack configuration
  stackName: 'AI-Agent-Dashboard',
  
  // Tags for cost tracking and resource organization
  tags: {
    Project: 'AI-Agent-Dashboard',
    Environment: 'Production',
    ManagedBy: 'CDK',
    CostCenter: 'AI-Platform',
  },
});