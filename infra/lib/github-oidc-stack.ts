import { Stack, type StackProps, CfnOutput } from "aws-cdk-lib";
import type { Construct } from "constructs";
import * as iam from "aws-cdk-lib/aws-iam";

const GITHUB_DOMAIN = "token.actions.githubusercontent.com";
const GITHUB_REPO = "tuankhanhbt/todo-app";

export class GithubOidcStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const provider = new iam.OpenIdConnectProvider(this, "GithubOidcProvider", {
      url: `https://${GITHUB_DOMAIN}`,
      clientIds: ["sts.amazonaws.com"],
    });

    const role = new iam.Role(this, "GithubActionsRole", {
      roleName: "todo-app-github-actions",
      description: "GitHub Actions deploy role for Todo App (CDK)",
      assumedBy: new iam.OpenIdConnectPrincipal(provider, {
        StringEquals: {
          [`${GITHUB_DOMAIN}:aud`]: "sts.amazonaws.com",
        },
        StringLike: {
          [`${GITHUB_DOMAIN}:sub`]: `repo:${GITHUB_REPO}:*`,
        },
      }),
    });

    role.addToPolicy(
      new iam.PolicyStatement({
        actions: ["sts:AssumeRole"],
        resources: [`arn:aws:iam::${this.account}:role/cdk-hnb659fds-*`],
      }),
    );

    new CfnOutput(this, "RoleArn", { value: role.roleArn });
  }
}
