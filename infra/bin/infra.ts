#!/usr/bin/env node
import { App } from "aws-cdk-lib";
import { TodoAppStack } from "../lib/todo-app-stack";
import { GithubOidcStack } from "../lib/github-oidc-stack";

const app = new App();

new TodoAppStack(app, "TodoAppStack", {
  env: { region: process.env.CDK_DEFAULT_REGION ?? "ap-southeast-1" },
});

new GithubOidcStack(app, "GithubOidcStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION ?? "ap-southeast-1",
  },
});
