import { getAuth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export async function GET(req: Request) {
  const { GET } = toNextJsHandler(getAuth());
  return GET(req);
}

export async function POST(req: Request) {
  const { POST } = toNextJsHandler(getAuth());
  return POST(req);
}
