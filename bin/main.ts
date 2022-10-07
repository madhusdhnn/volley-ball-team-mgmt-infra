#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import "source-map-support/register";
import { NetworkStack } from "../lib/network.stack";

const stackProps = {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT as string,
    region: process.env.CDK_DEFAULT_REGION as string,
  },
};

const app = new cdk.App();
const networkStack = new NetworkStack(app, "VTM-NetworkStack", stackProps);
