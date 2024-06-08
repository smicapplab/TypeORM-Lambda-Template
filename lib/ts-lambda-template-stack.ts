import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_appsync as appsync, aws_lambda as lambda, aws_ec2 as ec2, aws_rds as rds, aws_secretsmanager as secretsmanager } from 'aws-cdk-lib';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { readFileSync } from 'fs';

interface IAppSync extends cdk.StackProps {
  readonly vpcId: string
  readonly environment: string
}

export class TsLambdaTemplateStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: IAppSync) {
    super(scope, id, props);

    const vpc = ec2.Vpc.fromLookup(this, "VPC", {
      vpcId: props.vpcId,
    });

    const secret_name = `${props.environment}/aws-microservices`;

    const secrets = secretsmanager.Secret.fromSecretNameV2(this, `Secrets`, secret_name)

    const secretList = [
      "mysqlHost",
      "mysqlUser",
      "mysqlPassword",
    ];

    const getSecrets = () => {
      let environment = <any>{};

      if (secretList.length == 0) {
        return null
      }

      secretList.forEach((secretName) => {
        environment[secretName] = secrets.secretValueFromJson(secretName).unsafeUnwrap()
      });

      return environment;
    }

    // Create AppSync API
    const api = new appsync.CfnGraphQLApi(this, 'GraphqlApi', {
      name: 'LambdaGraphqlApi',
      authenticationType: 'API_KEY',
    });

    new appsync.CfnGraphQLSchema(this, 'GraphqlSchema', {
      apiId: api.attrApiId,
      definition: readFileSync("./graphql/schema.graphql", 'utf-8')
    });

    const apiKey = new appsync.CfnApiKey(this, 'ApiKey', {
      apiId: api.attrApiId
    });

    // Create Lambda Layer
    const lambdaLayer = new lambda.LayerVersion(this, 'TemplateLayer', {
      code: lambda.Code.fromAsset('src/lambda/layer'),
      compatibleRuntimes: [lambda.Runtime.NODEJS_18_X],
      description: 'A layer for my Lambda Template',
    });

    // Create Lambda Function
    const lambdaFunction = new lambda.Function(this, 'LambdaFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset('src/lambda/build'),
      handler: 'handler.main',
      environment: {
        ...getSecrets(),
        dbName: 'appsyncdb'
      },
      vpc,
      layers: [lambdaLayer],
    });

    // Grant Secrets Manager permissions to Lambda
    // databaseCredentialsSecret.grantRead(lambdaFunction);

    // Create DataSource and Resolver
    const dataSource = new appsync.CfnDataSource(this, 'LambdaDataSource', {
      apiId: api.attrApiId,
      name: 'LambdaDataSource',
      type: 'AWS_LAMBDA',
      lambdaConfig: {
        lambdaFunctionArn: lambdaFunction.functionArn
      },
      serviceRoleArn: lambdaFunction.role?.roleArn
    });

    new appsync.CfnResolver(this, 'QueryGetItemsResolver', {
      apiId: api.attrApiId,
      typeName: 'Query',
      fieldName: 'getItems',
      dataSourceName: dataSource.name
    }).node.addDependency(
      dataSource
    );

    new appsync.CfnResolver(this, 'MutationAddItemResolver', {
      apiId: api.attrApiId,
      typeName: 'Mutation',
      fieldName: 'addItem',
      dataSourceName: dataSource.name
    }).node.addDependency(
      dataSource
    );;

    const apiKeySecret = new Secret(this, `appsync-key`, {
      secretName: `appsync-key`,
      generateSecretString: {
        secretStringTemplate: JSON.stringify({
          apiKey: apiKey.attrApiKey
        }),
        generateStringKey: "generatedApiKey"
      }
    });

    // Outputs
    new cdk.CfnOutput(this, 'GraphQLAPIURL', {
      value: `https://${api.attrGraphQlUrl}`
    });

    new cdk.CfnOutput(this, 'APIKey', {
      value: ""//apiKey.attrKey
    });

    new cdk.CfnOutput(this, 'ProjectRegion', {
      value: this.region
    });
  }
}