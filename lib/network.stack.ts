import { Stack, StackProps } from "aws-cdk-lib";
import { Vpc, SubnetType } from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";

export class NetworkStack extends Stack {
  readonly vtmsVpc: Vpc;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    this.vtmsVpc = new Vpc(this, "VTM-Service-VPC-1", {
      vpcName: "VTM-Service-VPC-1",
      availabilityZones: ["us-east-1a"],
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: "application-subnet",
          subnetType: SubnetType.PUBLIC,
        },
        {
          cidrMask: 28,
          name: "datastore-subnet",
          subnetType: SubnetType.PRIVATE_ISOLATED,
        },
      ],
    });
  }
}
