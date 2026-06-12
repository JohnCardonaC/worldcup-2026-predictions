// World Cup 2026 predictions — minimal backend
// Routes (Lambda Function URL):
//   GET  /player/{id}   -> {item|null}
//   PUT  /player        -> upsert {id,name,state,points,pred_count}
//   GET  /ranking       -> top 100 by points
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

const TABLE = process.env.TABLE_NAME || "wc2026-players";
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

// Horario oficial (UTC) de los 104 partidos: las predicciones de un partido
// quedan congeladas en el servidor desde su hora de inicio (anti-trampa).
const KICKOFF_RAW = "A1|2026-06-11T19:00Z;A2|2026-06-12T02:00Z;B1|2026-06-12T19:00Z;D1|2026-06-13T01:00Z;B2|2026-06-13T19:00Z;C1|2026-06-13T22:00Z;C2|2026-06-14T01:00Z;D2|2026-06-14T04:00Z;E1|2026-06-14T17:00Z;F1|2026-06-14T20:00Z;E2|2026-06-14T23:00Z;F2|2026-06-15T02:00Z;H1|2026-06-15T16:00Z;G1|2026-06-15T19:00Z;H2|2026-06-15T22:00Z;G2|2026-06-16T01:00Z;I1|2026-06-16T19:00Z;I2|2026-06-16T22:00Z;J1|2026-06-17T01:00Z;J2|2026-06-17T04:00Z;K1|2026-06-17T17:00Z;L1|2026-06-17T20:00Z;L2|2026-06-17T23:00Z;K2|2026-06-18T02:00Z;A4|2026-06-18T16:00Z;B4|2026-06-18T19:00Z;B3|2026-06-18T22:00Z;A3|2026-06-19T01:00Z;D3|2026-06-19T19:00Z;C4|2026-06-19T22:00Z;C3|2026-06-20T01:00Z;D4|2026-06-20T04:00Z;F3|2026-06-20T17:00Z;E3|2026-06-20T20:00Z;E4|2026-06-21T00:00Z;F4|2026-06-21T04:00Z;H3|2026-06-21T16:00Z;G3|2026-06-21T19:00Z;H4|2026-06-21T22:00Z;G4|2026-06-22T01:00Z;J3|2026-06-22T17:00Z;I3|2026-06-22T21:00Z;I4|2026-06-23T00:00Z;J4|2026-06-23T03:00Z;K3|2026-06-23T17:00Z;L3|2026-06-23T20:00Z;L4|2026-06-23T23:00Z;K4|2026-06-24T02:00Z;B5|2026-06-24T19:00Z;B6|2026-06-24T19:00Z;C5|2026-06-24T22:00Z;C6|2026-06-24T22:00Z;A5|2026-06-25T01:00Z;A6|2026-06-25T01:00Z;E5|2026-06-25T20:00Z;E6|2026-06-25T20:00Z;F5|2026-06-25T23:00Z;F6|2026-06-25T23:00Z;D5|2026-06-26T02:00Z;D6|2026-06-26T02:00Z;I5|2026-06-26T19:00Z;I6|2026-06-26T19:00Z;H6|2026-06-27T00:00Z;H5|2026-06-27T00:00Z;G6|2026-06-27T03:00Z;G5|2026-06-27T03:00Z;L5|2026-06-27T21:00Z;L6|2026-06-27T21:00Z;K5|2026-06-27T23:30Z;K6|2026-06-27T23:30Z;J5|2026-06-28T02:00Z;J6|2026-06-28T02:00Z;73|2026-06-28T19:00Z;76|2026-06-29T17:00Z;74|2026-06-29T20:30Z;75|2026-06-30T01:00Z;78|2026-06-30T17:00Z;77|2026-06-30T21:00Z;79|2026-07-01T01:00Z;80|2026-07-01T16:00Z;82|2026-07-01T20:00Z;81|2026-07-02T00:00Z;84|2026-07-02T19:00Z;83|2026-07-02T23:00Z;85|2026-07-03T03:00Z;88|2026-07-03T18:00Z;86|2026-07-03T22:00Z;87|2026-07-04T01:30Z;90|2026-07-04T17:00Z;89|2026-07-04T21:00Z;91|2026-07-05T20:00Z;92|2026-07-06T00:00Z;93|2026-07-06T19:00Z;94|2026-07-07T00:00Z;95|2026-07-07T16:00Z;96|2026-07-07T20:00Z;97|2026-07-09T20:00Z;98|2026-07-10T19:00Z;99|2026-07-11T21:00Z;100|2026-07-12T01:00Z;101|2026-07-14T19:00Z;102|2026-07-15T19:00Z;103|2026-07-18T21:00Z;104|2026-07-19T19:00Z";
const KICKOFF = Object.fromEntries(KICKOFF_RAW.split(";").map(e => e.split("|")));
function frozenIds(now) {
  const gm = [], ko = [];
  for (const [id, ts] of Object.entries(KICKOFF)) {
    if (now >= Date.parse(ts)) (/^\d+$/.test(id) ? ko : gm).push(id);
  }
  return { gm, ko };
}
function freezeState(next, prevItem, now) {
  const { gm, ko } = frozenIds(now);
  const prev = prevItem && prevItem.state ? prevItem.state : null;
  next.pred = next.pred || {}; next.predKO = next.predKO || {}; next.predKOsc = next.predKOsc || {};
  for (const id of gm) {
    if (prev) {
      if (prev.pred && prev.pred[id] !== undefined) next.pred[id] = prev.pred[id];
      else delete next.pred[id];
    } else delete next.pred[id];
  }
  for (const id of ko) {
    if (prev) {
      if (prev.predKO && prev.predKO[id] !== undefined) next.predKO[id] = prev.predKO[id]; else delete next.predKO[id];
      if (prev.predKOsc && prev.predKOsc[id] !== undefined) next.predKOsc[id] = prev.predKOsc[id]; else delete next.predKOsc[id];
    } else { delete next.predKO[id]; delete next.predKOsc[id]; }
  }
  return next;
}

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
      const email = String(b.email || "").trim().toLowerCase().slice(0, 80);
      const pub = b.pub === false ? false : true; // aparecer en el ranking público
      const points = Math.max(0, Math.min(5000, parseInt(b.points, 10) || 0));
      const pred_count = Math.max(0, Math.min(104, parseInt(b.pred_count, 10) || 0));
      let state = b.state && typeof b.state === "object" ? b.state : {};
      if (!id || !name) return res(400, { error: "missing id/name" });
      const prev = await ddb.send(new GetCommand({ TableName: TABLE, Key: { id } }));
      state = freezeState(state, prev.Item, Date.now());
      await ddb.send(new PutCommand({
        TableName: TABLE,
        Item: { id, name, email: email || (prev.Item && prev.Item.email) || undefined, pub, state, points, pred_count, updated_at: new Date().toISOString() },
      }));
      return res(200, { ok: true });
    }
    if (method === "GET" && path === "/ranking") {
      const items = [];
      let key;
      do {
        const r = await ddb.send(new ScanCommand({
          TableName: TABLE,
          ProjectionExpression: "#n, points, pred_count, updated_at, pub",
          ExpressionAttributeNames: { "#n": "name" },
          ExclusiveStartKey: key,
        }));
        items.push(...(r.Items || []));
        key = r.LastEvaluatedKey;
      } while (key && items.length < 2000);
      const visible = items.filter((i) => i.pub !== false); // solo quienes aceptaron aparecer
      visible.sort((a, b) => (b.points - a.points) || (b.pred_count - a.pred_count));
      return res(200, { players: visible.slice(0, 100).map(({ pub, ...p }) => p), total: visible.length });
    }
    return res(404, { error: "not found" });
  } catch (e) {
    return res(500, { error: String(e && e.message || e) });
  }
};
