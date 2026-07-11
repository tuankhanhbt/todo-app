import { z } from "zod";
import { getUserId } from "../auth";
import { getRepository } from "../repository";
import { errorResponse, json, type ApiHandler } from "../http";
import { AppError } from "../errors";
import { toTodoResponse } from "../types";

const querySchema = z.object({
  status: z.enum(["pending", "done"]).optional(),
});

export const handler: ApiHandler = async (event) => {
  try {
    const userId = getUserId(event);
    const parsed = querySchema.safeParse(event.queryStringParameters ?? {});
    if (!parsed.success) {
      throw new AppError(
        "VALIDATION_ERROR",
        "status phải là 'pending' hoặc 'done'",
      );
    }
    const repo = getRepository();
    const todos = await repo.list(userId, parsed.data.status);
    return json(200, todos.map(toTodoResponse));
  } catch (err) {
    return errorResponse(err);
  }
};
