import type { VercelRequest, VercelResponse } from "@vercel/node";
import { waitUntil } from "@vercel/functions";
import { verifySlackSignature } from "../../src/services/slack";
import { handleTaskStatus } from "../../src/handlers/task-status";

// Vercel 기본 body parser 비활성화 (raw body 직접 읽기 위함)
export const config = { api: { bodyParser: false } };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  // Raw body 읽기
  let rawBody = "";
  for await (const chunk of req) {
    rawBody += typeof chunk === "string" ? chunk : Buffer.from(chunk).toString("utf-8");
  }

  // Slack 서명 검증
  const signingSecret = process.env.SLACK_SIGNING_SECRET!;
  const signature = req.headers["x-slack-signature"] as string | undefined;
  const timestamp = req.headers["x-slack-request-timestamp"] as string | undefined;

  if (!verifySlackSignature(signingSecret, signature, timestamp, rawBody)) {
    return res.status(401).send("Invalid signature");
  }

  // URL-encoded body 파싱
  const params = new URLSearchParams(rawBody);
  const command = params.get("command") ?? "";
  const text = params.get("text") ?? "";
  const responseUrl = params.get("response_url") ?? "";

  if (command !== "/작업현황") {
    return res.status(400).send("Unknown command");
  }

  // 비동기로 Notion 조회 → response_url로 결과 전송 (waitUntil로 함수 종료 방지)
  const responseType = process.env.RESPONSE_TYPE || "in_channel";
  waitUntil(handleTaskStatus(text, responseUrl, responseType));

  // 즉시 "조회 중..." 응답 (3초 타임아웃 우회)
  return res.status(200).json({ response_type: "ephemeral", text: "🔍 조회 중..." });
}
