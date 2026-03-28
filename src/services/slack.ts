import { createHmac, timingSafeEqual } from "crypto";

export function verifySlackSignature(
  signingSecret: string,
  signature: string | undefined,
  timestamp: string | undefined,
  body: string,
): boolean {
  if (!signature || !timestamp) return false;

  // 5분 이상 된 요청은 거부 (replay attack 방지)
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - Number(timestamp)) > 300) return false;

  const sigBasestring = `v0:${timestamp}:${body}`;
  const mySignature = "v0=" + createHmac("sha256", signingSecret).update(sigBasestring).digest("hex");

  return timingSafeEqual(new TextEncoder().encode(mySignature), new TextEncoder().encode(signature));
}

export async function sendResponseUrl(
  responseUrl: string,
  responseType: string,
  text: string,
): Promise<void> {
  await fetch(responseUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ response_type: responseType, text }),
  });
}
