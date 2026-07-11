export type TodoStatus = "pending" | "done";

export interface Todo {
  userId: string;
  todoId: string;
  title: string;
  status: TodoStatus;
  createdAt: string;
  updatedAt: string;
}

export type TodoResponse = Omit<Todo, "userId">;

export function toTodoResponse(todo: Todo): TodoResponse {
  const { userId, ...rest } = todo;
  return rest;
}
