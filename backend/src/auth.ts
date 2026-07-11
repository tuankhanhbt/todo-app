import type { ApiEvent } from "./http";
import { AppError } from "./errors";

export function getUserId(event: ApiEvent): string {
  const ctx = event.requestContext as unknown as {
    authorizer?: { jwt?: { claims?: Record<string, unknown> } };
  };
  const sub = ctx.authorizer?.jwt?.claims?.sub;
  if (typeof sub !== "string" || sub.length === 0) {
    throw new AppError("UNAUTHORIZED", "Thiếu hoặc token không hợp lệ");
  }
  return sub;
}
