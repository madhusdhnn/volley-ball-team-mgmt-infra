import { Stack, StackProps } from "aws-cdk-lib";
import {
  AmazonLinuxGeneration,
  Instance,
  InstanceClass,
  InstanceSize,
  InstanceType,
  MachineImage,
  Peer,
  Port,
  SecurityGroup,
  UserData,
} from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";
import { DataBaseStack } from "./database.stack";
import { NetworkStack, WEB_SERVER_SUBNET_NAME } from "./network.stack";
import * as fs from "fs";
import * as path from "path";

export class VTMMicroServiceStack extends Stack {
  constructor(
    scope: Construct,
    id: string,
    networkStack: NetworkStack,
    databaseStack: DataBaseStack,
    props?: StackProps
  ) {
    super(scope, id, props);

    const webAccessSg = this.createWebAccessSecurityGroup(networkStack);

    const t2Micro = InstanceType.of(InstanceClass.T2, InstanceSize.MICRO);
    const amazonLinuxImage = MachineImage.latestAmazonLinux({ generation: AmazonLinuxGeneration.AMAZON_LINUX_2 });

    // create EC2 instance in public subnet[T2.MICRO (Amazon Linux Image)]
    const vtmsWebServer = new Instance(this, "VTM-WebServer-1", {
      vpc: networkStack.vtmsVpc,
      securityGroup: webAccessSg,
      instanceType: t2Micro,
      machineImage: amazonLinuxImage,
      instanceName: "VTM-WebServer-1",
      keyName: "vtms-ssh-connect",
      vpcSubnets: { subnetGroupName: WEB_SERVER_SUBNET_NAME },
    });

    databaseStack.dbAccessUserSecret.grantRead(vtmsWebServer);
    vtmsWebServer.addUserData(fs.readFileSync(path.resolve(__dirname, "helpers", "app-user-data.sh"), "utf-8"));
  }

  private createWebAccessSecurityGroup(networkStack: NetworkStack) {
    const sgProps = { securityGroupName: "VTM-WebAccess-SG", vpc: networkStack.vtmsVpc };
    const webAccessSg = new SecurityGroup(this, "VTM-WebAccess-SG", sgProps);
    webAccessSg.addIngressRule(Peer.anyIpv4(), Port.tcp(5001), "Allow port 5001 for HTTP connection");
    webAccessSg.addIngressRule(Peer.anyIpv4(), Port.tcp(5002), "Allow port 5002 for HTTP connection");
    webAccessSg.addIngressRule(Peer.anyIpv4(), Port.tcp(5003), "Allow port 5003 for HTTP connection");
    webAccessSg.addIngressRule(Peer.anyIpv4(), Port.tcp(22), "Allow port 22 for SSH connection");
    return webAccessSg;
  }
}
