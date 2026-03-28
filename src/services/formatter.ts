import type { TaskItem, QueryParams } from "../types/notion";

interface GroupedTasks {
  overdue: TaskItem[];
  inProgress: TaskItem[];
  upcoming: TaskItem[];
  paused: TaskItem[];
}

function groupTasks(tasks: TaskItem[]): GroupedTasks {
  const groups: GroupedTasks = {
    overdue: [],
    inProgress: [],
    upcoming: [],
    paused: [],
  };

  for (const task of tasks) {
    if (task.isOverdue) {
      groups.overdue.push(task);
    } else if (task.status === "진행 중") {
      groups.inProgress.push(task);
    } else if (task.status === "진행 예정") {
      groups.upcoming.push(task);
    } else if (task.status === "일시 정지") {
      groups.paused.push(task);
    }
  }

  return groups;
}

function formatDeadline(deadline: string | null): string {
  if (!deadline) return "-";
  // "2026-04-08" → "4/8"
  const d = new Date(deadline);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function formatTaskLine(task: TaskItem): string {
  const assigneeStr = task.assignees.length > 0 ? task.assignees.join(", ") : "-";
  const deadlineStr = formatDeadline(task.deadline);
  return `• ${task.title} — ${assigneeStr} (마감: ${deadlineStr}, ${task.sprint}) [${task.priority}]`;
}

function formatSection(emoji: string, label: string, tasks: TaskItem[], collapseAfter?: number): string {
  if (tasks.length === 0) return "";

  const lines: string[] = [`${emoji} ${label} (${tasks.length}건)`];
  const limit = collapseAfter ?? tasks.length;
  const visible = tasks.slice(0, limit);
  const remaining = tasks.length - limit;

  for (const task of visible) {
    lines.push(formatTaskLine(task));
  }

  if (remaining > 0) {
    lines.push(`  ...외 ${remaining}건`);
  }

  return lines.join("\n");
}

function buildHeader(params: QueryParams): string {
  const today = new Date();
  const dateStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, "0")}.${String(today.getDate()).padStart(2, "0")}`;

  switch (params.mode) {
    case "team":
      return `📋 [${params.teamName}팀] 작업 현황 — ${dateStr} 기준`;
    case "person":
      return `📋 [${params.personName}] 작업 현황 — ${dateStr} 기준`;
    case "overdue":
      return `📋 마감 초과 작업 — ${dateStr} 기준`;
    default:
      return `📋 전체 작업 현황 — ${dateStr} 기준`;
  }
}

export function formatTaskMessage(tasks: TaskItem[], params: QueryParams): string {
  if (tasks.length === 0) {
    return "📭 조건에 맞는 작업이 없습니다.";
  }

  const header = buildHeader(params);
  const groups = groupTasks(tasks);

  const sections = [
    formatSection("🔴", "마감 초과", groups.overdue),
    formatSection("🟢", "진행 중", groups.inProgress),
    formatSection("🔵", "진행 예정", groups.upcoming),
    formatSection("⏸️", "일시 정지", groups.paused, 5),
  ].filter(Boolean);

  const summary = [
    `진행 중 ${groups.inProgress.length}`,
    `예정 ${groups.upcoming.length}`,
    `정지 ${groups.paused.length}`,
    `지연 ${groups.overdue.length}`,
  ].join(" | ");

  return [header, "", ...sections, "", "━━━━━━━━━━━━━━━", `합계: ${summary}`].join("\n");
}
