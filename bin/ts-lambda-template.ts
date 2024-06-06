#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { TsLambdaTemplateStack } from '../lib/ts-lambda-template-stack';

const app = new cdk.App();

const environment = app.node.tryGetContext("environment");
const envConfigs = app.node.tryGetContext("environments");
const tags = app.node.tryGetContext("tags");

let envConfig = envConfigs.dev

new TsLambdaTemplateStack(app, 'TsLambdaTemplateStack', {
  env : envConfig.env,
  vpcId: envConfig.config.vpcId,
  environment,
  tags: {
    ...tags
  }
});