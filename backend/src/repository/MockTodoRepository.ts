import { randomUUID } from "node:crypto";
import type { Todo, TodoStatus } from "../types";
import type {
  CreateTodoInput,
  TodoRepository,
  UpdateTodoInput,
} from "./TodoRepository";

export class MockTodoRepository implements TodoRepository {
  private readonly store = new Map<string, Todo>();

  async list(userId: string, status?: TodoStatus): Promise<Todo[]> {
    const mine = [...this.store.values()].filter((t) => t.userId === userId);
    const filtered = status ? mine.filter((t) => t.status === status) : mine;
    return filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
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
    this.store.set(this.key(todo.userId, todo.todoId), todo);
    return todo;
  }

  async getById(userId: string, todoId: string): Promise<Todo | undefined> {
    return this.store.get(this.key(userId, todoId));
  }

  async update(
    userId: string,
    todoId: string,
    patch: UpdateTodoInput,
  ): Promise<Todo | undefined> {
    const existing = this.store.get(this.key(userId, todoId));
    if (!existing) return undefined;
    const updated: Todo = {
      ...existing,
      ...(patch.title !== undefined ? { title: patch.title } : {}),
      ...(patch.status !== undefined ? { status: patch.status } : {}),
      updatedAt: new Date().toISOString(),
    };
    this.store.set(this.key(userId, todoId), updated);
    return updated;
  }

  async complete(userId: string, todoId: string): Promise<Todo | undefined> {
    const existing = this.store.get(this.key(userId, todoId));
    if (!existing) return undefined;
    const updated: Todo = {
      ...existing,
      status: "done",
      updatedAt: new Date().toISOString(),
    };
    this.store.set(this.key(userId, todoId), updated);
    return updated;
  }

  async delete(userId: string, todoId: string): Promise<boolean> {
    return this.store.delete(this.key(userId, todoId));
  }

  private key(userId: string, todoId: string): string {
    return `${userId}#${todoId}`;
  }
}
