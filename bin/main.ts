#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import "source-map-support/register";
import { DataBaseStack } from "../lib/database.stack";
import { NetworkStack } from "../lib/network.stack";
import { VTMMicroServiceStack } from "../lib/service.stack";

const stackProps = {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT as string,
    region: process.env.CDK_DEFAULT_REGION as string,
  },
};

const app = new cdk.App();
const networkStack = new NetworkStack(app, "VTM-NetworkStack", {
  ...stackProps,
  description: "This stack creates a new VPC with 1 public subnet and 1 private (isolated) subnet in max 2 AZ",
});

const databaseStack = new DataBaseStack(app, "VTM-DatabaseStack", networkStack, {
  ...stackProps,
  stage: "production",
  description: "This stack creates a new RDS Postgres database in private (isolated) subnet",
});

new VTMMicroServiceStack(app, "VTM-MicroServiceStack", networkStack, databaseStack, {
  ...stackProps,
  description: "This stack creates a new EC2 Linux server (T2.MICRO) in public subnet",
});
