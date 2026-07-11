import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "node:crypto";
import type { Todo, TodoStatus } from "../types";
import type {
  CreateTodoInput,
  TodoRepository,
  UpdateTodoInput,
} from "./TodoRepository";

export class DynamoTodoRepository implements TodoRepository {
  private readonly doc: DynamoDBDocumentClient;

  constructor(private readonly tableName: string) {
    this.doc = DynamoDBDocumentClient.from(new DynamoDBClient({}), {
      marshallOptions: { removeUndefinedValues: true },
    });
  }

  async list(userId: string, status?: TodoStatus): Promise<Todo[]> {
    const res = await this.doc.send(
      new QueryCommand({
        TableName: this.tableName,
        KeyConditionExpression: "userId = :uid",
        ...(status
          ? {
              FilterExpression: "#status = :status",
              ExpressionAttributeNames: { "#status": "status" },
              ExpressionAttributeValues: { ":uid": userId, ":status": status },
            }
          : { ExpressionAttributeValues: { ":uid": userId } }),
      }),
    );
    const items = (res.Items ?? []) as Todo[];
    return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async create(input: CreateTodoInput): Promise<Todo> {
    const now = new Date().toISOString();
    const todo: Todo = {
      userId: input.userId,
      todoId: randomUUID(),
      title: input.title,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    };
    await this.doc.send(new PutCommand({ TableName: this.tableName, Item: todo }));
    return todo;
  }

  async getById(userId: string, todoId: string): Promise<Todo | undefined> {
    const res = await this.doc.send(
      new GetCommand({ TableName: this.tableName, Key: { userId, todoId } }),
    );
    return res.Item as Todo | undefined;
  }

  async update(
    userId: string,
    todoId: string,
    patch: UpdateTodoInput,
  ): Promise<Todo | undefined> {
    const names: Record<string, string> = { "#updatedAt": "updatedAt" };
    const values: Record<string, string> = {
      ":updatedAt": new Date().toISOString(),
    };
    const sets = ["#updatedAt = :updatedAt"];
    if (patch.title !== undefined) {
      names["#title"] = "title";
      values[":title"] = patch.title;
      sets.push("#title = :title");
    }
    if (patch.status !== undefined) {
      names["#status"] = "status";
      values[":status"] = patch.status;
      sets.push("#status = :status");
    }
    return this.runUpdate(userId, todoId, `SET ${sets.join(", ")}`, names, values);
  }

  async complete(userId: string, todoId: string): Promise<Todo | undefined> {
    return this.runUpdate(
      userId,
      todoId,
      "SET #status = :done, #updatedAt = :updatedAt",
      { "#status": "status", "#updatedAt": "updatedAt" },
      { ":done": "done", ":updatedAt": new Date().toISOString() },
    );
  }

  async delete(userId: string, todoId: string): Promise<boolean> {
    try {
      await this.doc.send(
        new DeleteCommand({
          TableName: this.tableName,
          Key: { userId, todoId },
          ConditionExpression: "attribute_exists(userId)",
        }),
      );
      return true;
    } catch (err) {
      if (isConditionalFail(err)) return false;
      throw err;
    }
  }

  private async runUpdate(
    userId: string,
    todoId: string,
    updateExpression: string,
    names: Record<string, string>,
    values: Record<string, string>,
  ): Promise<Todo | undefined> {
    try {
      const res = await this.doc.send(
        new UpdateCommand({
          TableName: this.tableName,
          Key: { userId, todoId },
          UpdateExpression: updateExpression,
          ConditionExpression: "attribute_exists(userId)",
          ExpressionAttributeNames: names,
          ExpressionAttributeValues: values,
          ReturnValues: "ALL_NEW",
        }),
      );
      return res.Attributes as Todo;
    } catch (err) {
      if (isConditionalFail(err)) return undefined;
      throw err;
    }
  }
}

function isConditionalFail(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "name" in err &&
    (err as { name: string }).name === "ConditionalCheckFailedException"
  );
}
