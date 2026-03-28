import type { QueryParams } from "../types/notion";
import { isTeamName, lookupMember } from "../config/members";
import { queryNotionTasks } from "../services/notion";
import { formatTaskMessage } from "../services/formatter";
import type { Respond } from "slack-cloudflare-workers";

interface Env {
  NOTION_API_TOKEN: string;
  NOTION_DATABASE_ID: string;
  RESPONSE_TYPE: string;
}

function parseCommand(text: string): { params: QueryParams; label: string } {
  const trimmed = text.trim();

  if (!trimmed) {
    return { params: { mode: "all" }, label: "전체" };
  }

  if (trimmed === "지연") {
    return { params: { mode: "overdue" }, label: "지연" };
  }

  if (isTeamName(trimmed)) {
    return {
      params: { mode: "team", teamName: trimmed },
      label: `[${trimmed}팀]`,
    };
  }

  const member = lookupMember(trimmed);
  if (member) {
    return {
      params: { mode: "person", personUuid: member.uuid, personName: member.name },
      label: `[${member.name}]`,
    };
  }

  return {
    params: { mode: "all" },
    label: `__NOT_FOUND__:${trimmed}`,
  };
}

export async function handleTaskStatus(
  env: Env,
  text: string,
  respond: Respond,
): Promise<void> {
  const { params, label } = parseCommand(text);

  if (label.startsWith("__NOT_FOUND__:")) {
    const name = label.split(":")[1];
    await respond({
      text: `❓ "${name}"에 해당하는 팀원을 찾을 수 없습니다.\n등록된 팀원 이름 또는 팀명(기획/개발)을 입력해주세요.`,
      response_type: "ephemeral" as const,
    });
    return;
  }

  try {
    const tasks = await queryNotionTasks(env, params);

    if (tasks.length === 0) {
      await respond({
        text: "📭 조건에 맞는 작업이 없습니다.",
        response_type: "ephemeral" as const,
      });
      return;
    }

    const responseType = (env.RESPONSE_TYPE === "ephemeral" ? "ephemeral" : "in_channel") as "ephemeral" | "in_channel";
    const message = formatTaskMessage(tasks, label);
    await respond({
      response_type: responseType,
      text: message,
    });
  } catch (error) {
    console.error("Error querying Notion:", error);
    await respond({
      text: "⚠️ 조회 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
      response_type: "ephemeral" as const,
    });
  }
}
