#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { NetworkStack } from "../lib/network.stack";
import { ApplicationStack } from "../lib/application.stack";

const stackProps = {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
};

const app = new cdk.App();
const networkStack = new NetworkStack(app, "VTM-NetworkStack", stackProps);
const applicationStack = new ApplicationStack(app, "VTM-ApplicationStack", networkStack, stackProps);
