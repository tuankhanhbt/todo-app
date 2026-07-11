import * as path from "node:path";
import {
  Stack,
  type StackProps,
  RemovalPolicy,
  Duration,
  CfnOutput,
} from "aws-cdk-lib";
import type { Construct } from "constructs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import {
  HttpApi,
  HttpMethod,
  CorsHttpMethod,
} from "aws-cdk-lib/aws-apigatewayv2";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import { HttpJwtAuthorizer } from "aws-cdk-lib/aws-apigatewayv2-authorizers";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";

export class TodoAppStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const table = new dynamodb.Table(this, "TodosTable", {
      tableName: "Todos",
      partitionKey: { name: "userId", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "todoId", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const backendDir = path.join(__dirname, "..", "..", "backend");
    const handlersDir = path.join(backendDir, "src", "handlers");

    const makeFn = (id: string, file: string): NodejsFunction =>
      new NodejsFunction(this, id, {
        entry: path.join(handlersDir, file),
        handler: "handler",
        runtime: lambda.Runtime.NODEJS_20_X,
        timeout: Duration.seconds(10),
        environment: { TODOS_TABLE: table.tableName },
        depsLockFilePath: path.join(backendDir, "package-lock.json"),
        bundling: {
          externalModules: [
            "@aws-sdk/client-dynamodb",
            "@aws-sdk/lib-dynamodb",
          ],
        },
      });

    const listFn = makeFn("ListTodosFn", "listTodos.ts");
    const createFn = makeFn("CreateTodoFn", "createTodo.ts");
    const updateFn = makeFn("UpdateTodoFn", "updateTodo.ts");
    const completeFn = makeFn("CompleteTodoFn", "completeTodo.ts");
    const deleteFn = makeFn("DeleteTodoFn", "deleteTodo.ts");

    table.grantReadData(listFn);
    table.grantWriteData(createFn);
    table.grantWriteData(updateFn);
    table.grantWriteData(completeFn);
    table.grantWriteData(deleteFn);

    const siteBucket = new s3.Bucket(this, "SiteBucket", {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const distribution = new cloudfront.Distribution(this, "SiteDistribution", {
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(siteBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      defaultRootObject: "index.html",
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
        },
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
        },
      ],
    });

    new s3deploy.BucketDeployment(this, "DeploySite", {
      sources: [
        s3deploy.Source.asset(
          path.join(__dirname, "..", "..", "frontend", "dist"),
        ),
      ],
      destinationBucket: siteBucket,
      distribution,
      distributionPaths: ["/*"],
    });

    const siteUrl = `https://${distribution.distributionDomainName}`;

    const userPool = new cognito.UserPool(this, "TodoUserPool", {
      userPoolName: "todo-user-pool",
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      autoVerify: { email: true },
      standardAttributes: {
        email: { required: true, mutable: true },
      },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: false,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const userPoolClient = userPool.addClient("TodoAppClient", {
      userPoolClientName: "todo-app-client",
      generateSecret: false,
      authFlows: {
        userPassword: true,
        userSrp: true,
        adminUserPassword: true,
      },
      oAuth: {
        flows: { authorizationCodeGrant: true },
        scopes: [
          cognito.OAuthScope.OPENID,
          cognito.OAuthScope.EMAIL,
          cognito.OAuthScope.PROFILE,
        ],
        callbackUrls: [
          "http://localhost:5173",
          "http://localhost:5173/",
          siteUrl,
          `${siteUrl}/`,
        ],
        logoutUrls: [
          "http://localhost:5173",
          "http://localhost:5173/",
          siteUrl,
          `${siteUrl}/`,
        ],
      },
    });

    const userPoolDomain = userPool.addDomain("TodoUserPoolDomain", {
      cognitoDomain: { domainPrefix: "todo-app-844479804958" },
    });

    const authorizer = new HttpJwtAuthorizer(
      "JwtAuthorizer",
      userPool.userPoolProviderUrl,
      { jwtAudience: [userPoolClient.userPoolClientId] },
    );

    const api = new HttpApi(this, "TodosHttpApi", {
      apiName: "todos-api",
      defaultAuthorizer: authorizer,
      corsPreflight: {
        allowHeaders: ["content-type", "authorization"],
        allowMethods: [
          CorsHttpMethod.GET,
          CorsHttpMethod.POST,
          CorsHttpMethod.PUT,
          CorsHttpMethod.PATCH,
          CorsHttpMethod.DELETE,
          CorsHttpMethod.OPTIONS,
        ],
        allowOrigins: ["*"],
      },
    });

    api.addRoutes({
      path: "/todos",
      methods: [HttpMethod.GET],
      integration: new HttpLambdaIntegration("ListInt", listFn),
    });
    api.addRoutes({
      path: "/todos",
      methods: [HttpMethod.POST],
      integration: new HttpLambdaIntegration("CreateInt", createFn),
    });
    api.addRoutes({
      path: "/todos/{todoId}",
      methods: [HttpMethod.PUT],
      integration: new HttpLambdaIntegration("UpdateInt", updateFn),
    });
    api.addRoutes({
      path: "/todos/{todoId}/complete",
      methods: [HttpMethod.PATCH],
      integration: new HttpLambdaIntegration("CompleteInt", completeFn),
    });
    api.addRoutes({
      path: "/todos/{todoId}",
      methods: [HttpMethod.DELETE],
      integration: new HttpLambdaIntegration("DeleteInt", deleteFn),
    });

    new CfnOutput(this, "ApiUrl", { value: api.apiEndpoint });
    new CfnOutput(this, "TableName", { value: table.tableName });
    new CfnOutput(this, "UserPoolId", { value: userPool.userPoolId });
    new CfnOutput(this, "UserPoolClientId", {
      value: userPoolClient.userPoolClientId,
    });
    new CfnOutput(this, "Region", { value: this.region });
    new CfnOutput(this, "HostedUiDomain", { value: userPoolDomain.baseUrl() });
    new CfnOutput(this, "SiteUrl", { value: siteUrl });
  }
}
