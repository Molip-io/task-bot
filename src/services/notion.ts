import type { NotionPage, NotionQueryResponse, TaskItem, QueryParams } from "../types/notion";
import { extractNickname } from "../config/members";

const NOTION_API_BASE = "https://api.notion.com/v1";

function buildFilter(params: QueryParams): Record<string, unknown> {
  const notCompleted = {
    property: "Status",
    status: { does_not_equal: "완료" },
  };

  switch (params.mode) {
    case "team":
      return {
        filter: {
          and: [notCompleted, { property: "팀", select: { equals: params.teamName } }],
        },
      };
    case "person":
      return {
        filter: {
          and: [notCompleted, { property: "담당자", people: { contains: params.personUuid } }],
        },
      };
    default:
      return { filter: notCompleted };
  }
}

async function queryDatabase(body: Record<string, unknown>): Promise<NotionPage[]> {
  const token = process.env.NOTION_API_TOKEN!;
  const dbId = process.env.NOTION_DATABASE_ID!;
  const pages: NotionPage[] = [];
  let cursor: string | undefined;

  do {
    const payload: Record<string, unknown> = {
      ...body,
      page_size: 100,
      ...(cursor ? { start_cursor: cursor } : {}),
    };

    const res = await fetch(`${NOTION_API_BASE}/databases/${dbId}/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Notion API error ${res.status}: ${errorText}`);
    }

    const data = (await res.json()) as NotionQueryResponse;
    pages.push(...data.results);
    cursor = data.has_more ? (data.next_cursor ?? undefined) : undefined;
  } while (cursor);

  return pages;
}

function parseTaskItem(page: NotionPage, today: string): TaskItem {
  const props = page.properties;

  const title = props["작업"]?.title?.[0]?.plain_text ?? "(제목 없음)";
  const status = props["Status"]?.status?.name ?? "알 수 없음";
  const team = props["팀"]?.select?.name ?? "-";
  const assignees = (props["담당자"]?.people ?? []).map((p) => extractNickname(p.name));
  const priority = props["우선순위"]?.select?.name ?? "-";
  const sprint = props["Sprint"]?.select?.name ?? "-";
  const deadline = props["시작날짜 <-> Dead Line"]?.date?.end ?? null;
  const project = props["Project"]?.select?.name ?? "-";

  const isOverdue = deadline !== null && status !== "완료" && deadline < today;

  return { title, status, team, assignees, priority, sprint, deadline, project, isOverdue };
}

export async function queryNotionTasks(params: QueryParams): Promise<TaskItem[]> {
  const today = new Date().toISOString().slice(0, 10);
  const filterBody = buildFilter(params);

  const sortedBody = {
    ...filterBody,
    sorts: [{ property: "우선순위", direction: "ascending" }],
  };

  const pages = await queryDatabase(sortedBody);
  const tasks = pages.map((page) => parseTaskItem(page, today));

  if (params.mode === "overdue") {
    return tasks.filter((t) => t.isOverdue);
  }

  return tasks;
}
