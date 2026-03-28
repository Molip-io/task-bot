import { SlackApp } from "slack-cloudflare-workers";
import { handleTaskStatus } from "./handlers/task-status";

export interface Env {
  SLACK_SIGNING_SECRET: string;
  SLACK_BOT_TOKEN: string;
  NOTION_API_TOKEN: string;
  NOTION_DATABASE_ID: string;
  RESPONSE_TYPE: string;
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    const app = new SlackApp({ env });

    app.command(
      "/작업현황",
      // sync ack — 3초 내 즉시 응답
      async (_req) => {
        return "🔍 조회 중...";
      },
      // lazy listener — 비동기로 Notion 쿼리 + 결과 전송
      async ({ context: { respond }, payload }) => {
        const text = payload.text?.trim() || "";
        await handleTaskStatus(env, text, respond);
      },
    );

    return await app.run(request, ctx);
  },
};
