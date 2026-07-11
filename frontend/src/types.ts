export type TodoStatus = "pending" | "done";

export interface Todo {
  todoId: string;
  title: string;
  status: TodoStatus;
  createdAt: string;
  updatedAt: string;
}
