import type { Env, QueryParams } from "../types/notion";
import type { Respond } from "../types/slack";
import { findMemberUuid, isTeamName } from "../config/members";
import { queryNotionTasks } from "../services/notion";
import { formatTaskMessage } from "../services/formatter";

function parseCommand(text: string): QueryParams {
  const trimmed = text.trim();

  if (!trimmed) {
    return { mode: "all" };
  }

  if (trimmed === "지연") {
    return { mode: "overdue" };
  }

  if (isTeamName(trimmed)) {
    return { mode: "team", teamName: trimmed };
  }

  const uuid = findMemberUuid(trimmed);
  if (uuid) {
    return { mode: "person", personUuid: uuid, personName: trimmed };
  }

  return { mode: "all" };
}

export async function handleTaskStatus(
  env: Env,
  text: string,
  respond: Respond,
): Promise<void> {
  const params = parseCommand(text);

  // 이름으로 입력했는데 매핑이 없는 경우
  if (text.trim() && params.mode === "all" && text.trim() !== "지연" && !isTeamName(text.trim())) {
    await respond({ text: `❓ "${text.trim()}" — 해당 팀원을 찾을 수 없습니다.\n등록된 이름 또는 팀명(기획/개발), "지연"을 입력해주세요.` });
    return;
  }

  try {
    const tasks = await queryNotionTasks(env, params);
    const message = formatTaskMessage(tasks, params);
    const responseType = (env.RESPONSE_TYPE || "in_channel") as "ephemeral" | "in_channel";
    await respond({ response_type: responseType, text: message });
  } catch (error) {
    console.error("Task status query error:", error);
    await respond({ text: "⚠️ 조회 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요." });
  }
}
