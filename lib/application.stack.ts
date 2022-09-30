import { Stack, StackProps } from "aws-cdk-lib";
import {
  Instance,
  InstanceClass,
  InstanceSize,
  InstanceType,
  MachineImage,
  Peer,
  Port,
  SecurityGroup,
  SubnetType,
} from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";
import { NetworkStack } from "./network.stack";

export class ApplicationStack extends Stack {
  constructor(scope: Construct, id: string, networkStack: NetworkStack, props?: StackProps) {
    super(scope, id, props);

    // security group. Allow ports 80 and 22
    const vtmsSgOne = new SecurityGroup(this, "VTM-Service-SG-1", {
      securityGroupName: "VTM-Service-SG-1",
      vpc: networkStack.vtmsVpc,
    });

    vtmsSgOne.addIngressRule(Peer.anyIpv4(), Port.tcp(80), "Allow port 80 for HTTP connections");
    vtmsSgOne.addIngressRule(Peer.anyIpv4(), Port.tcp(22), "Allow port 22 for SSH connections");

    // create EC2 instance in public subnet
    new Instance(this, "VTM-Service-EC2", {
      vpc: networkStack.vtmsVpc,
      securityGroup: vtmsSgOne,
      instanceType: InstanceType.of(InstanceClass.T2, InstanceSize.MICRO),
      machineImage: MachineImage.latestAmazonLinux(),
      vpcSubnets: {
        subnetType: SubnetType.PUBLIC,
      },
    });
  }
}
