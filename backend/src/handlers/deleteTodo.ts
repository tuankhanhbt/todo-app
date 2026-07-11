import { getUserId } from "../auth";
import { getRepository } from "../repository";
import { errorResponse, noContent, type ApiHandler } from "../http";
import { AppError } from "../errors";

export const handler: ApiHandler = async (event) => {
  try {
    const userId = getUserId(event);
    const todoId = event.pathParameters?.todoId;
    if (!todoId) throw new AppError("VALIDATION_ERROR", "Thiếu todoId");
    const repo = getRepository();
    const deleted = await repo.delete(userId, todoId);
    if (!deleted) throw new AppError("NOT_FOUND", "Không tìm thấy todo");
    return noContent();
  } catch (err) {
    return errorResponse(err);
  }
};
