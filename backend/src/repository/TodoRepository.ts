import type { Todo, TodoStatus } from "../types";

export interface CreateTodoInput {
  userId: string;
  title: string;
}

export interface UpdateTodoInput {
  title?: string;
  status?: TodoStatus;
}

export interface TodoRepository {
  list(userId: string, status?: TodoStatus): Promise<Todo[]>;
  create(input: CreateTodoInput): Promise<Todo>;
  getById(userId: string, todoId: string): Promise<Todo | undefined>;
  update(
    userId: string,
    todoId: string,
    patch: UpdateTodoInput,
  ): Promise<Todo | undefined>;
  complete(userId: string, todoId: string): Promise<Todo | undefined>;
  delete(userId: string, todoId: string): Promise<boolean>;
}
