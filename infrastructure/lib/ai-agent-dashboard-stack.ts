import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Duration, RemovalPolicy } from 'aws-cdk-lib';

export interface AiAgentDashboardStackProps extends cdk.StackProps {
  /**
   * The environment name (dev, staging, prod)
   */
  environment?: string;
  
  /**
   * Bedrock model IDs to use
   */
  bedrockModels?: string[];
}

export class AiAgentDashboardStack extends cdk.Stack {
  public readonly apiGatewayUrl: string;
  public readonly agentExecutionLambda: lambda.Function;
  public readonly bedrockAccessRole: iam.Role;

  constructor(scope: Construct, id: string, props: AiAgentDashboardStackProps = {}) {
    super(scope, id, props);

    const environment = props.environment || 'production';
    const bedrockModels = props.bedrockModels || [
      'amazon.titan-text-express-v1',
      'amazon.titan-text-lite-v1',
      'anthropic.claude-v2',
      'anthropic.claude-v1',
    ];

    // ============================================
    // SSM Parameters for Configuration
    // ============================================
    
    const bedrockRegionParam = new ssm.StringParameter(this, 'BedrockRegionParameter', {
      parameterName: `/ai-agent-dashboard/${environment}/bedrock-region`,
      stringValue: this.region,
      description: 'AWS region for Bedrock service',
    });

    const bedrockModelsParam = new ssm.StringListParameter(this, 'BedrockModelsParameter', {
      parameterName: `/ai-agent-dashboard/${environment}/bedrock-models`,
      stringListValue: bedrockModels,
      description: 'List of available Bedrock model IDs',
    });

    // ============================================
    // Secrets Management
    // ============================================
    
    const apiSecret = new secretsmanager.Secret(this, 'ApiSecret', {
      secretName: `ai-agent-dashboard/${environment}/api-secrets`,
      description: 'API keys and secrets for AI Agent Dashboard',
      removalPolicy: environment === 'production' ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
    });

    // ============================================
    // IAM Role for Bedrock Access
    // ============================================
    
    this.bedrockAccessRole = new iam.Role(this, 'BedrockAccessRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      roleName: `AI-Agent-Dashboard-Bedrock-Role-${environment}`,
      description: 'IAM role for Lambda functions to access Amazon Bedrock',
      inlinePolicies: {
        BedrockAccessPolicy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                'bedrock:InvokeModel',
                'bedrock:InvokeModelWithResponseStream',
                'bedrock:ListFoundationModels',
                'bedrock:GetFoundationModel',
              ],
              resources: [
                `arn:aws:bedrock:${this.region}::foundation-model/${bedrockModels.join('*')}`,
                `arn:aws:bedrock:${this.region}::foundation-model/*`,
              ],
            }),
          ],
        }),
        CloudWatchLogsPolicy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                'logs:CreateLogGroup',
                'logs:CreateLogStream',
                'logs:PutLogEvents',
              ],
              resources: ['*'],
            }),
          ],
        }),
        SSMReadPolicy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ['ssm:GetParameter', 'ssm:GetParameters'],
              resources: [
                `arn:aws:ssm:${this.region}:${this.account}:parameter/ai-agent-dashboard/${environment}/*`,
              ],
            }),
          ],
        }),
        SecretsManagerReadPolicy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ['secretsmanager:GetSecretValue'],
              resources: [apiSecret.secretArn],
            }),
          ],
        }),
      },
    });

    // ============================================
    // Lambda Function for Agent Execution
    // ============================================
    
    this.agentExecutionLambda = new lambda.Function(this, 'AgentExecutionLambda', {
      functionName: `AI-Agent-Dashboard-Executor-${environment}`,
      description: 'Lambda function for executing AI agent workflows with Bedrock',
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'dist/agent-execution.handler',
      role: this.bedrockAccessRole,
      timeout: Duration.minutes(15),
      memorySize: 512,
      environment: {
        ENVIRONMENT: environment,
        BEDROCK_REGION: this.region,
        BEDROCK_MODELS: bedrockModels.join(','),
        LOG_LEVEL: environment === 'production' ? 'INFO' : 'DEBUG',
      },
      logRetention: logs.RetentionDays.ONE_WEEK,
      code: lambda.Code.fromAsset('lambda/agent-execution'),
    });

    // Add Lambda layer for common utilities
    const utilsLayer = new lambda.LayerVersion(this, 'UtilsLayer', {
      description: 'Common utilities for AI Agent Dashboard Lambda functions',
      compatibleRuntimes: [lambda.Runtime.NODEJS_18_X],
      code: lambda.Code.fromAsset('lambda/layers/utils'),
    });
    this.agentExecutionLambda.addLayers(utilsLayer);

    // ============================================
    // API Gateway
    // ============================================
    
    const api = new apigateway.RestApi(this, 'AgentDashboardApi', {
      restApiName: `AI-Agent-Dashboard-API-${environment}`,
      description: 'API Gateway for AI Agent Dashboard',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
          'X-Amz-Security-Token',
        ],
      },
      deployOptions: {
        stageName: environment,
        throttlingBurstLimit: 100,
        throttlingRateLimit: 50,
        loggingLevel: apigateway.MethodLoggingLevel.INFO,
        dataTraceEnabled: true,
        metricsEnabled: true,
      },
    });

    // ============================================
    // API Resources and Endpoints
    // ============================================
    
    // Agent execution endpoint
    const agentsResource = api.root.addResource('agents');
    const agentExecutionResource = agentsResource.addResource('execute');
    
    const agentExecutionIntegration = new apigateway.LambdaIntegration(
      this.agentExecutionLambda,
      {
        requestTemplates: {
          'application/json': JSON.stringify({
            statusCode: 200,
          }),
        },
      }
    );

    agentExecutionResource.addMethod('POST', agentExecutionIntegration, {
      authorizer: new apigateway.RequestAuthorizer(this, 'RequestAuthorizer', {
        handler: new lambda.Function(this, 'AuthorizerLambda', {
          functionName: `AI-Agent-Dashboard-Authorizer-${environment}`,
          runtime: lambda.Runtime.NODEJS_18_X,
          handler: 'dist/authorizer.handler',
          code: lambda.Code.fromAsset('lambda/authorizer'),
          role: this.bedrockAccessRole,
        }),
        identitySources: [apigateway.IdentitySource.header('Authorization')],
      }),
      methodResponses: [
        {
          statusCode: '200',
          responseParameters: {
            'method.response.header.Content-Type': true,
            'method.response.header.Access-Control-Allow-Origin': true,
          },
        },
        {
          statusCode: '400',
          responseParameters: {
            'method.response.header.Content-Type': true,
          },
        },
        {
          statusCode: '500',
          responseParameters: {
            'method.response.header.Content-Type': true,
          },
        },
      ],
    });

    // Health check endpoint
    const healthResource = api.root.addResource('health');
    const healthLambda = new lambda.Function(this, 'HealthCheckLambda', {
      functionName: `AI-Agent-Dashboard-Health-${environment}`,
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'dist/health-check.handler',
      code: lambda.Code.fromAsset('lambda/health-check'),
      timeout: Duration.seconds(30),
    });
    
    healthResource.addMethod('GET', new apigateway.LambdaIntegration(healthLambda));

    // Models list endpoint
    const modelsResource = api.root.addResource('models');
    const modelsLambda = new lambda.Function(this, 'ModelsLambda', {
      functionName: `AI-Agent-Dashboard-Models-${environment}`,
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'dist/models.handler',
      code: lambda.Code.fromAsset('lambda/models'),
      role: this.bedrockAccessRole,
      timeout: Duration.seconds(30),
      environment: {
        BEDROCK_REGION: this.region,
      },
    });
    
    modelsResource.addMethod('GET', new apigateway.LambdaIntegration(modelsLambda));

    // ============================================
    // CloudWatch Alarms
    // ============================================
    
    const lambdaErrorAlarm = new cloudwatch.Alarm(this, 'LambdaErrorAlarm', {
      metric: this.agentExecutionLambda.metricErrors(),
      threshold: 5,
      evaluationPeriods: 1,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
      alarmDescription: 'Alarm if Lambda function error rate exceeds threshold',
    });

    const apiLatencyAlarm = new cloudwatch.Alarm(this, 'ApiLatencyAlarm', {
      metric: api.metricLatency({
        statistic: 'Average',
      }),
      threshold: 10000,
      evaluationPeriods: 2,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
      alarmDescription: 'Alarm if API latency exceeds 10 seconds',
    });

    // ============================================
    // Outputs
    // ============================================
    
    this.apiGatewayUrl = api.url;
    
    new cdk.CfnOutput(this, 'ApiGatewayUrl', {
      value: api.url,
      description: 'API Gateway URL for AI Agent Dashboard',
    });

    new cdk.CfnOutput(this, 'AgentExecutionLambdaArn', {
      value: this.agentExecutionLambda.functionArn,
      description: 'ARN of the Agent Execution Lambda function',
    });

    new cdk.CfnOutput(this, 'BedrockRoleArn', {
      value: this.bedrockAccessRole.roleArn,
      description: 'ARN of the Bedrock access IAM role',
    });

    new cdk.CfnOutput(this, 'ApiSecretArn', {
      value: apiSecret.secretArn,
      description: 'ARN of the API secrets in Secrets Manager',
    });
  }
}