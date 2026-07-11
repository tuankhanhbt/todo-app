import { useState, type FormEvent } from "react";
import { usePrefs } from "../prefs/PrefsContext";
import { Toggles } from "./Toggles";
import {
  useCompleteTodo,
  useCreateTodo,
  useDeleteTodo,
  useSetTodoStatus,
  useTodos,
} from "../hooks/useTodos";
import type { Todo } from "../types";

interface Props {
  email: string;
  onLogout: () => void;
}

export function TodoPage({ email, onLogout }: Props) {
  const { t, lang } = usePrefs();
  const todos = useTodos();
  const createTodo = useCreateTodo();
  const completeTodo = useCompleteTodo();
  const reopenTodo = useSetTodoStatus();
  const deleteTodo = useDeleteTodo();
  const [draft, setDraft] = useState("");

  const all = todos.data ?? [];
  const pending = all.filter((x) => x.status === "pending");
  const completed = all.filter((x) => x.status === "done");

  const handleAdd = (e: FormEvent) => {
    e.preventDefault();
    const value = draft.trim();
    if (!value) return;
    createTodo.mutate(value, { onSuccess: () => setDraft("") });
  };

  const greeting = () => {
    const h = new Date().getHours();
    return h < 12 ? t.gmorning : h < 18 ? t.gafternoon : t.gevening;
  };

  const dateLabel = () => {
    const now = new Date();
    if (lang === "vi") {
      const days = [
        "Chủ nhật",
        "Thứ hai",
        "Thứ ba",
        "Thứ tư",
        "Thứ năm",
        "Thứ sáu",
        "Thứ bảy",
      ];
      return `${days[now.getDay()]}, ${now.getDate()} tháng ${now.getMonth() + 1}`;
    }
    return now.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  const summary =
    pending.length === 0
      ? t.summaryNone
      : `${t.summaryOne}${pending.length}${t.summaryTwo}`;

  return (
    <div className="min-h-screen box-border px-6 pb-16">
      <div className="max-w-[620px] mx-auto">
        <div className="flex items-center justify-between py-[22px]">
          <span className="serif italic text-[21px] font-medium text-[var(--text)]">
            Mộc
          </span>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-[12px] text-[var(--text3)]">
              {email}
            </span>
            <Toggles />
            <button
              onClick={onLogout}
              className="px-[13px] py-[6px] rounded-full border border-[var(--line)] text-[var(--text2)] text-[12px] font-semibold cursor-pointer transition hover:text-[var(--text)]"
            >
              {t.signOut}
            </button>
          </div>
        </div>

        <div className="mt-9">
          <div className="text-[13px] text-[var(--text3)] font-medium">
            {dateLabel()}
          </div>
          <h1 className="serif mt-2 text-[44px] font-medium tracking-[-.015em] leading-[1.1] text-[var(--text)]">
            {greeting()}
          </h1>
          <div className="mt-2 text-[15px] text-[var(--text2)]">{summary}</div>
        </div>

        <form
          onSubmit={handleAdd}
          className="flex items-center gap-3 mt-[30px] mb-[26px] bg-[var(--surface)] border border-[var(--line)] rounded-[15px] pl-[18px] pr-2.5 py-2 shadow-[0_6px_24px_rgba(0,0,0,.12)]"
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={t.addTask}
            className="flex-1 bg-transparent border-none text-[var(--text)] text-[16.5px] outline-none py-3"
          />
          <button
            type="submit"
            disabled={createTodo.isPending}
            aria-label="add"
            className="w-10 h-10 flex-none rounded-xl bg-[var(--accent)] text-white text-[21px] leading-none cursor-pointer transition hover:opacity-90 disabled:opacity-50"
          >
            +
          </button>
        </form>
        {createTodo.isError && (
          <p className="text-sm text-[#c25e5e] mb-4">{createTodo.error.message}</p>
        )}

        {todos.isLoading && <p className="text-[var(--text2)]">{t.loading}</p>}
        {todos.isError && <p className="text-[#c25e5e]">{todos.error.message}</p>}

        <div className="flex flex-col">
          {pending.map((todo) => (
            <TaskRow
              key={todo.todoId}
              todo={todo}
              onToggle={() => completeTodo.mutate(todo.todoId)}
              onDelete={() => deleteTodo.mutate(todo.todoId)}
            />
          ))}
        </div>

        {todos.data && pending.length === 0 && (
          <div className="text-center py-[52px] text-[var(--text3)]">
            <div className="serif italic text-[22px] text-[var(--text2)]">
              {t.emptyTitle}
            </div>
            <div className="mt-1.5 text-[13.5px]">{t.emptySub}</div>
          </div>
        )}

        {completed.length > 0 && (
          <div className="mt-[30px]">
            <div className="text-[11.5px] tracking-[.12em] uppercase text-[var(--text3)] font-semibold mb-1.5">
              {t.done} · {completed.length}
            </div>
            {completed.map((todo) => (
              <CompletedRow
                key={todo.todoId}
                todo={todo}
                onToggle={() =>
                  reopenTodo.mutate({ todoId: todo.todoId, status: "pending" })
                }
                onDelete={() => deleteTodo.mutate(todo.todoId)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TaskRow({
  todo,
  onToggle,
  onDelete,
}: {
  todo: Todo;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center gap-3.5 py-[15px] px-1.5 border-b border-[var(--line)] animate-popIn">
      <button
        onClick={onToggle}
        aria-label="complete"
        className="w-[22px] h-[22px] flex-none rounded-full border-[1.5px] border-[var(--text3)] bg-transparent cursor-pointer transition hover:border-[var(--accent)]"
      />
      <div className="flex-1 min-w-0 text-[15.5px] text-[var(--text)] truncate">
        {todo.title}
      </div>
      <button
        onClick={onDelete}
        aria-label="delete"
        className="border-none bg-transparent text-[var(--text3)] text-[17px] cursor-pointer px-1 opacity-50 transition hover:opacity-100 hover:text-[#c25e5e]"
      >
        ×
      </button>
    </div>
  );
}

function CompletedRow({
  todo,
  onToggle,
  onDelete,
}: {
  todo: Todo;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center gap-3.5 py-2.5 px-1.5 opacity-55 transition hover:opacity-80">
      <button
        onClick={onToggle}
        aria-label="reopen"
        className="w-[22px] h-[22px] flex-none rounded-full border-[1.5px] border-[var(--accent)] bg-[var(--accent)] text-white text-[12px] flex items-center justify-center cursor-pointer"
      >
        ✓
      </button>
      <div className="flex-1 text-[15px] text-[var(--text2)] line-through">
        {todo.title}
      </div>
      <button
        onClick={onDelete}
        aria-label="delete"
        className="border-none bg-transparent text-[var(--text3)] text-[17px] cursor-pointer px-1 transition hover:text-[#c25e5e]"
      >
        ×
      </button>
    </div>
  );
}
