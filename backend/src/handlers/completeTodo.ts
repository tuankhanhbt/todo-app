import { getUserId } from "../auth";
import { getRepository } from "../repository";
import { errorResponse, json, type ApiHandler } from "../http";
import { AppError } from "../errors";
import { toTodoResponse } from "../types";

export const handler: ApiHandler = async (event) => {
  try {
    const userId = getUserId(event);
    const todoId = event.pathParameters?.todoId;
    if (!todoId) throw new AppError("VALIDATION_ERROR", "Thiếu todoId");
    const repo = getRepository();
    const updated = await repo.complete(userId, todoId);
    if (!updated) throw new AppError("NOT_FOUND", "Không tìm thấy todo");
    return json(200, toTodoResponse(updated));
  } catch (err) {
    return errorResponse(err);
  }
};
