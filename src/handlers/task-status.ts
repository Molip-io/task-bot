import type { QueryParams } from "../types/notion";
import { findMemberUuid, isTeamName, isProjectName, findProjectName } from "../config/members";
import { queryNotionTasks } from "../services/notion";
import { formatTaskMessage } from "../services/formatter";
import { sendResponseUrl } from "../services/slack";

function parseCommand(text: string): QueryParams {
  const trimmed = text.trim();

  if (!trimmed) return { mode: "all" };
  if (trimmed === "지연") return { mode: "overdue" };
  if (isTeamName(trimmed)) return { mode: "team", teamName: trimmed };
  const projectName = findProjectName(trimmed);
  if (projectName) return { mode: "project", projectName };

  const uuid = findMemberUuid(trimmed);
  if (uuid) return { mode: "person", personUuid: uuid, personName: trimmed };

  return { mode: "all" };
}

export async function handleTaskStatus(
  text: string,
  responseUrl: string,
  responseType: string,
): Promise<void> {
  const params = parseCommand(text);

  // 이름으로 입력했는데 매핑이 없는 경우
  if (text.trim() && params.mode === "all" && text.trim() !== "지연" && !isTeamName(text.trim()) && !isProjectName(text.trim())) {
    await sendResponseUrl(
      responseUrl,
      responseType,
      `❓ "${text.trim()}" — 해당 팀원을 찾을 수 없습니다.\n등록된 이름 또는 팀명(기획/개발), "지연"을 입력해주세요.`,
    );
    return;
  }

  try {
    const tasks = await queryNotionTasks(params);
    const message = formatTaskMessage(tasks, params);
    await sendResponseUrl(responseUrl, responseType, message);
  } catch (error) {
    console.error("Task status query error:", error);
    await sendResponseUrl(responseUrl, responseType, "⚠️ 조회 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
  }
}
