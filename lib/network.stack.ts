import { Stack, StackProps } from "aws-cdk-lib";
import { SubnetType, Vpc } from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";

export const WEB_SERVER_SUBNET_NAME: string = "web-server";
export const DB_SUBNET_NAME: string = "database";

export class NetworkStack extends Stack {
  readonly vtmsVpc: Vpc;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    this.vtmsVpc = new Vpc(this, "VTM-VPC", {
      vpcName: "VTM-VPC",
      cidr: "10.0.0.0/16",
      maxAzs: 2,
      subnetConfiguration: [
        {
          cidrMask: 28,
          name: WEB_SERVER_SUBNET_NAME,
          subnetType: SubnetType.PUBLIC,
        },
        {
          cidrMask: 28,
          name: DB_SUBNET_NAME,
          subnetType: SubnetType.PRIVATE_ISOLATED,
        },
      ],
    });
  }
}
