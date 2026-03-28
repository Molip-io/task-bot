import { SlackApp } from "slack-cloudflare-workers";
import type { Env } from "./types/notion";
import { handleTaskStatus } from "./handlers/task-status";

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const app = new SlackApp({ env });

    app.command(
      "/작업현황",
      // sync ack — 3초 내 즉시 응답
      async (_req) => {
        return "🔍 조회 중...";
      },
      // lazy listener — 비동기 Notion 쿼리 + 결과 전송
      async ({ context: { respond }, payload }) => {
        const text = payload.text ?? "";
        await handleTaskStatus(env, text, respond);
      },
    );

    return await app.run(request, ctx);
  },
};
