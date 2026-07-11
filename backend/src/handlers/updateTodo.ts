import { z } from "zod";
import { getUserId } from "../auth";
import { getRepository } from "../repository";
import { errorResponse, json, parseJsonBody, type ApiHandler } from "../http";
import { AppError } from "../errors";
import { toTodoResponse } from "../types";

const bodySchema = z
  .object({
    title: z.string().trim().min(1, "title không được rỗng").optional(),
    status: z.enum(["pending", "done"]).optional(),
  })
  .refine((b) => b.title !== undefined || b.status !== undefined, {
    message: "Cần ít nhất 1 field: title hoặc status",
  });

export const handler: ApiHandler = async (event) => {
  try {
    const userId = getUserId(event);
    const todoId = event.pathParameters?.todoId;
    if (!todoId) throw new AppError("VALIDATION_ERROR", "Thiếu todoId");
    const parsed = bodySchema.safeParse(parseJsonBody(event.body));
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? "Body không hợp lệ";
      throw new AppError("VALIDATION_ERROR", msg);
    }
    const repo = getRepository();
    const updated = await repo.update(userId, todoId, parsed.data);
    if (!updated) throw new AppError("NOT_FOUND", "Không tìm thấy todo");
    return json(200, toTodoResponse(updated));
  } catch (err) {
    return errorResponse(err);
  }
};
