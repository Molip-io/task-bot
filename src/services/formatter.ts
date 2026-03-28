import type { TaskItem } from "../types/notion";

interface GroupedTasks {
  overdue: TaskItem[];
  inProgress: TaskItem[];
  upcoming: TaskItem[];
  paused: TaskItem[];
}

function isOverdue(task: TaskItem): boolean {
  if (!task.deadline) return false;
  const today = new Date().toISOString().split("T")[0];
  return task.deadline < today && task.status !== "완료";
}

function groupTasks(tasks: TaskItem[]): GroupedTasks {
  const groups: GroupedTasks = {
    overdue: [],
    inProgress: [],
    upcoming: [],
    paused: [],
  };

  for (const task of tasks) {
    if (isOverdue(task)) {
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
  const parts = deadline.split("-");
  return `${parseInt(parts[1])}/${parseInt(parts[2])}`;
}

function formatTaskLine(task: TaskItem): string {
  const assignees = task.assignees.length > 0 ? task.assignees.join(", ") : "-";
  const deadline = formatDeadline(task.deadline);
  const priority = task.priority !== "-" ? ` [${task.priority}]` : "";
  return `• ${task.title} — ${assignees} (마감: ${deadline}, ${task.sprint})${priority}`;
}

function formatSection(
  emoji: string,
  label: string,
  tasks: TaskItem[],
  collapsible = false,
  maxVisible = 5,
): string {
  if (tasks.length === 0) return "";

  const lines: string[] = [];
  lines.push(`${emoji} ${label} (${tasks.length}건)`);

  const visible = collapsible ? tasks.slice(0, maxVisible) : tasks;
  for (const task of visible) {
    lines.push(formatTaskLine(task));
  }

  if (collapsible && tasks.length > maxVisible) {
    lines.push(`  ...외 ${tasks.length - maxVisible}건`);
  }

  return lines.join("\n");
}

function buildHeader(label: string): string {
  const today = new Date();
  const dateStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, "0")}.${String(today.getDate()).padStart(2, "0")}`;
  return `📋 ${label} 작업 현황 — ${dateStr} 기준`;
}

function buildFooter(groups: GroupedTasks): string {
  return [
    "━━━━━━━━━━━━━━━",
    `합계: 진행 중 ${groups.inProgress.length} | 예정 ${groups.upcoming.length} | 정지 ${groups.paused.length} | 지연 ${groups.overdue.length}`,
  ].join("\n");
}

export function formatTaskMessage(
  tasks: TaskItem[],
  label = "전체",
): string {
  const groups = groupTasks(tasks);

  const sections = [
    buildHeader(label),
    "",
    formatSection("🔴", "마감 초과", groups.overdue),
    formatSection("🟢", "진행 중", groups.inProgress),
    formatSection("🔵", "진행 예정", groups.upcoming),
    formatSection("⏸️", "일시 정지", groups.paused, true),
    "",
    buildFooter(groups),
  ]
    .filter((s) => s !== undefined)
    .join("\n");

  // 빈 섹션 사이의 중복 빈줄 제거
  return sections.replace(/\n{3,}/g, "\n\n");
}
