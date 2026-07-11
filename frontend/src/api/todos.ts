import type { Todo, TodoStatus } from "../types";

const API_URL = import.meta.env.VITE_API_URL;

async function request<T>(
  token: string,
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.error?.message ?? `Lỗi ${res.status}`);
  }
  return data as T;
}

export function listTodos(token: string): Promise<Todo[]> {
  return request<Todo[]>(token, "/todos");
}

export function createTodo(token: string, title: string): Promise<Todo> {
  return request<Todo>(token, "/todos", {
    method: "POST",
    body: JSON.stringify({ title }),
  });
}

export function completeTodo(token: string, todoId: string): Promise<Todo> {
  return request<Todo>(token, `/todos/${todoId}/complete`, { method: "PATCH" });
}

export function setTodoStatus(
  token: string,
  todoId: string,
  status: TodoStatus,
): Promise<Todo> {
  return request<Todo>(token, `/todos/${todoId}`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
}

export function deleteTodo(token: string, todoId: string): Promise<void> {
  return request<void>(token, `/todos/${todoId}`, { method: "DELETE" });
}
