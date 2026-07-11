import { createServer, type IncomingMessage } from "node:http";
import type { ApiEvent, ApiHandler } from "./http";
import { handler as listTodos } from "./handlers/listTodos";
import { handler as createTodo } from "./handlers/createTodo";
import { handler as updateTodo } from "./handlers/updateTodo";
import { handler as completeTodo } from "./handlers/completeTodo";
import { handler as deleteTodo } from "./handlers/deleteTodo";

const PORT = 3001;

async function readBody(req: IncomingMessage): Promise<string | undefined> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  return chunks.length ? Buffer.concat(chunks).toString("utf8") : undefined;
}

function buildEvent(
  method: string,
  path: string,
  query: Record<string, string>,
  pathParameters: Record<string, string>,
  body: string | undefined,
): ApiEvent {
  return {
    version: "2.0",
    routeKey: `${method} ${path}`,
    rawPath: path,
    rawQueryString: "",
    headers: {},
    queryStringParameters: query,
    pathParameters,
    requestContext: {
      http: {
        method,
        path,
        protocol: "HTTP/1.1",
        sourceIp: "127.0.0.1",
        userAgent: "local-dev",
      },
      authorizer: { jwt: { claims: { sub: "local-dev-user" }, scopes: [] } },
    },
    body,
    isBase64Encoded: false,
  } as unknown as ApiEvent;
}

interface Route {
  method: string;
  match: RegExp;
  params: string[];
  handler: ApiHandler;
}

const routes: Route[] = [
  { method: "GET", match: /^\/todos$/, params: [], handler: listTodos },
  { method: "POST", match: /^\/todos$/, params: [], handler: createTodo },
  {
    method: "PATCH",
    match: /^\/todos\/([^/]+)\/complete$/,
    params: ["todoId"],
    handler: completeTodo,
  },
  { method: "PUT", match: /^\/todos\/([^/]+)$/, params: ["todoId"], handler: updateTodo },
  {
    method: "DELETE",
    match: /^\/todos\/([^/]+)$/,
    params: ["todoId"],
    handler: deleteTodo,
  },
];

const server = createServer(async (req, res) => {
  try {
    const method = req.method ?? "GET";
    const url = new URL(req.url ?? "/", `http://localhost:${PORT}`);
    const path = url.pathname;
    const query = Object.fromEntries(url.searchParams);
    const body = await readBody(req);

    const route = routes.find((r) => r.method === method && r.match.test(path));
    if (!route) {
      res.writeHead(404, { "content-type": "application/json" });
      res.end(
        JSON.stringify({
          error: { code: "NOT_FOUND", message: "Route not found" },
        }),
      );
      return;
    }

    const captures = path.match(route.match) ?? [];
    const pathParameters: Record<string, string> = {};
    route.params.forEach((name, i) => {
      pathParameters[name] = captures[i + 1] ?? "";
    });

    const event = buildEvent(method, path, query, pathParameters, body);
    const result = await route.handler(event);

    res.writeHead(result.statusCode ?? 200, {
      "content-type": "application/json",
    });
    res.end(result.body ?? "");
  } catch (err) {
    console.error(err);
    res.writeHead(500, { "content-type": "application/json" });
    res.end(
      JSON.stringify({
        error: { code: "INTERNAL", message: "Internal server error" },
      }),
    );
  }
});

server.listen(PORT, () => {
  console.log(`Local API: http://localhost:${PORT}`);
});
