import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from "aws-lambda";
import { AppError } from "./errors";

export type ApiEvent = APIGatewayProxyEventV2;
export type ApiResult = APIGatewayProxyStructuredResultV2;
export type ApiHandler = (event: ApiEvent) => Promise<ApiResult>;

export function json(statusCode: number, body: unknown): ApiResult {
  return {
    statusCode,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  };
}

export function noContent(): ApiResult {
  return { statusCode: 204, body: "" };
}

export function parseJsonBody(body: string | undefined): unknown {
  if (!body) return {};
  try {
    return JSON.parse(body);
  } catch {
    throw new AppError("VALIDATION_ERROR", "Body phải là JSON hợp lệ");
  }
}

export function errorResponse(err: unknown): ApiResult {
  if (err instanceof AppError) {
    return json(err.status, { error: { code: err.code, message: err.message } });
  }
  console.error("Unhandled error:", err);
  return json(500, {
    error: { code: "INTERNAL", message: "Internal server error" },
  });
}
