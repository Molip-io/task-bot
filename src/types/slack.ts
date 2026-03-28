import type { WebhookParams } from "slack-web-api-client";

export type Respond = (params: WebhookParams) => Promise<Response>;
