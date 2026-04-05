import { createClient } from "@libsql/client/http";
import { drizzle } from "drizzle-orm/libsql/http";
import * as schema from "./schema";

function getDb() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    throw new Error("TURSO_DATABASE_URL is not set");
  }

  const client = createClient({ url, authToken });
  return drizzle(client, { schema });
}

// Singleton for server-side use (avoid creating a new client per request in dev)
let _db: ReturnType<typeof getDb> | null = null;

export function db() {
  if (!_db) {
    _db = getDb();
  }
  return _db;
}

export type DB = ReturnType<typeof getDb>;
