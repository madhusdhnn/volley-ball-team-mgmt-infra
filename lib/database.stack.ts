import { Duration, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { InstanceClass, InstanceSize, InstanceType, Peer, Port, SecurityGroup } from "aws-cdk-lib/aws-ec2";
import { Credentials, DatabaseInstance, DatabaseInstanceEngine, PostgresEngineVersion } from "aws-cdk-lib/aws-rds";
import { Secret } from "aws-cdk-lib/aws-secretsmanager";
import { Construct } from "constructs";
import { DB_SUBNET_NAME, NetworkStack } from "./network.stack";

export interface DatabaseStackProps extends StackProps {
  stage: "development" | "production";
}
const engine = DatabaseInstanceEngine.postgres({ version: PostgresEngineVersion.VER_13_7 });
const instanceType = InstanceType.of(InstanceClass.T3, InstanceSize.MICRO);
const port = 5432;
const backupWindow = "00:00-00:59";

export class DataBaseStack extends Stack {
  readonly dbAccessUserSecret: Secret;
  private dbInstance: DatabaseInstance;

  constructor(scope: Construct, id: string, networkStack: NetworkStack, props: DatabaseStackProps) {
    super(scope, id, props);

    const dbName = `volley_db_${props.stage}`;

    // create database master user secret and store it in Secrets Manager
    const masterUserSecret = new Secret(this, "VTM-db-master-user-secret", {
      secretName: "vtms-db-master-user-secret",
      description: "VTMS Database master user credentials",
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: "postgres" }),
        generateStringKey: "password",
        passwordLength: 16,
        excludePunctuation: true,
        excludeCharacters: '"@/\\',
      },
    });

    // create database access user secret and store it in Secrets Manager
    this.dbAccessUserSecret = new Secret(this, "VTM-db-access-user-secret", {
      secretName: "vtms-db-access-user-secret",
      description: "VTMS Database application user credentials",
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: "vtm_service_user" }),
        generateStringKey: "password",
        passwordLength: 16,
        excludePunctuation: true,
        excludeCharacters: '"@/\\',
      },
    });

    const dbSecurityGroup = this.createDatabaseAccessSG(networkStack);

    // create RDS instance (PostgreSQL)
    this.dbInstance = new DatabaseInstance(this, "VTM-DB-1", {
      vpc: networkStack.vtmsVpc,
      vpcSubnets: { subnetGroupName: DB_SUBNET_NAME },
      instanceType,
      engine,
      port,
      securityGroups: [dbSecurityGroup],
      databaseName: dbName,
      credentials: Credentials.fromSecret(masterUserSecret),
      backupRetention: Duration.days(7),
      preferredBackupWindow: backupWindow,
      deleteAutomatedBackups: true,
      maxAllocatedStorage: 500,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    this.dbAccessUserSecret.attach(this.dbInstance);
  }

  private createDatabaseAccessSG(networkStack: NetworkStack) {
    const sgProps = { securityGroupName: "VTM-Database-SG", vpc: networkStack.vtmsVpc };
    const dbSg = new SecurityGroup(this, "VTM-Database-SG", sgProps);
    dbSg.addIngressRule(
      Peer.ipv4(networkStack.vtmsVpc.vpcCidrBlock),
      Port.tcp(port),
      `Allow port ${port} for database connection from only within the VPC (${networkStack.vtmsVpc.vpcId})`
    );
    return dbSg;
  }
}
