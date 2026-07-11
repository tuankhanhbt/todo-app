import { MockTodoRepository } from "./MockTodoRepository";
import { DynamoTodoRepository } from "./DynamoTodoRepository";
import type { TodoRepository } from "./TodoRepository";

let instance: TodoRepository | undefined;

export function getRepository(): TodoRepository {
  if (!instance) {
    const tableName = process.env.TODOS_TABLE;
    const useMock = process.env.USE_MOCK === "true";
    instance =
      tableName && !useMock
        ? new DynamoTodoRepository(tableName)
        : new MockTodoRepository();
  }
  return instance;
}

export type {
  TodoRepository,
  CreateTodoInput,
  UpdateTodoInput,
} from "./TodoRepository";
