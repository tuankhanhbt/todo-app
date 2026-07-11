import { useAuth } from "react-oidc-context";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  completeTodo,
  createTodo,
  deleteTodo,
  listTodos,
  setTodoStatus,
} from "../api/todos";
import type { TodoStatus } from "../types";

const TODOS_KEY = ["todos"] as const;

function useToken(): string {
  const auth = useAuth();
  return auth.user?.id_token ?? "";
}

export function useTodos() {
  const token = useToken();
  return useQuery({
    queryKey: TODOS_KEY,
    queryFn: () => listTodos(token),
    enabled: token !== "",
  });
}

export function useCreateTodo() {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (title: string) => createTodo(token, title),
    onSuccess: () => qc.invalidateQueries({ queryKey: TODOS_KEY }),
  });
}

export function useCompleteTodo() {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (todoId: string) => completeTodo(token, todoId),
    onSuccess: () => qc.invalidateQueries({ queryKey: TODOS_KEY }),
  });
}

export function useSetTodoStatus() {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { todoId: string; status: TodoStatus }) =>
      setTodoStatus(token, vars.todoId, vars.status),
    onSuccess: () => qc.invalidateQueries({ queryKey: TODOS_KEY }),
  });
}

export function useDeleteTodo() {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (todoId: string) => deleteTodo(token, todoId),
    onSuccess: () => qc.invalidateQueries({ queryKey: TODOS_KEY }),
  });
}
