import { z } from "zod";
import { getUserId } from "../auth";
import { getRepository } from "../repository";
import { errorResponse, json, parseJsonBody, type ApiHandler } from "../http";
import { AppError } from "../errors";
import { toTodoResponse } from "../types";

const bodySchema = z.object({
  title: z.string().trim().min(1, "title là bắt buộc và không được rỗng"),
});

export const handler: ApiHandler = async (event) => {
  try {
    const userId = getUserId(event);
    const raw = parseJsonBody(event.body);
    const parsed = bodySchema.safeParse(raw);
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? "Body không hợp lệ";
      throw new AppError("VALIDATION_ERROR", msg);
    }
    const repo = getRepository();
    const todo = await repo.create({ userId, title: parsed.data.title });
    return json(201, toTodoResponse(todo));
  } catch (err) {
    return errorResponse(err);
  }
};
