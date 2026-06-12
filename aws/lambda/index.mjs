// World Cup 2026 predictions — minimal backend
// Routes (Lambda Function URL):
//   GET  /player/{id}   -> {item|null}
//   PUT  /player        -> upsert {id,name,state,points,pred_count}
//   GET  /ranking       -> top 100 by points
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

const TABLE = process.env.TABLE_NAME || "wc2026-players";
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const res = (code, body) => ({
  statusCode: code,
  headers: { "content-type": "application/json" },
  body: JSON.stringify(body),
});

export const handler = async (event) => {
  // Soporta Function URL / API Gateway HTTP API (payload 2.0) y payload 1.0
  const method = event.requestContext?.http?.method || event.httpMethod || "GET";
  const path = event.rawPath || event.path || "/";
  try {
    if (method === "GET" && path.startsWith("/player/")) {
      const id = decodeURIComponent(path.slice("/player/".length)).slice(0, 80);
      if (!id) return res(400, { error: "missing id" });
      const r = await ddb.send(new GetCommand({ TableName: TABLE, Key: { id } }));
      return res(200, { item: r.Item || null });
    }
    if (method === "PUT" && path === "/player") {
      if ((event.body || "").length > 120000) return res(413, { error: "too large" });
      let b;
      try { b = JSON.parse(event.body || "{}"); } catch { return res(400, { error: "bad json" }); }
      const id = String(b.id || "").slice(0, 80);
      const name = String(b.name || "").trim().slice(0, 30);
      const points = Math.max(0, Math.min(5000, parseInt(b.points, 10) || 0));
      const pred_count = Math.max(0, Math.min(104, parseInt(b.pred_count, 10) || 0));
      const state = b.state && typeof b.state === "object" ? b.state : {};
      if (!id || !name) return res(400, { error: "missing id/name" });
      await ddb.send(new PutCommand({
        TableName: TABLE,
        Item: { id, name, state, points, pred_count, updated_at: new Date().toISOString() },
      }));
      return res(200, { ok: true });
    }
    if (method === "GET" && path === "/ranking") {
      const items = [];
      let key;
      do {
        const r = await ddb.send(new ScanCommand({
          TableName: TABLE,
          ProjectionExpression: "#n, points, pred_count, updated_at",
          ExpressionAttributeNames: { "#n": "name" },
          ExclusiveStartKey: key,
        }));
        items.push(...(r.Items || []));
        key = r.LastEvaluatedKey;
      } while (key && items.length < 2000);
      items.sort((a, b) => (b.points - a.points) || (b.pred_count - a.pred_count));
      return res(200, { players: items.slice(0, 100), total: items.length });
    }
    return res(404, { error: "not found" });
  } catch (e) {
    return res(500, { error: String(e && e.message || e) });
  }
};
