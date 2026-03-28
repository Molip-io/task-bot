import type { NotionPage, NotionQueryResponse, TaskItem, QueryParams } from "../types/notion";

interface Env {
  NOTION_API_TOKEN: string;
  NOTION_DATABASE_ID: string;
}

const NOTION_API_BASE = "https://api.notion.com/v1";

function buildFilter(params: QueryParams, today: string): Record<string, unknown> {
  const notCompleted = {
    property: "Status",
    status: { does_not_equal: "완료" },
  };

  switch (params.mode) {
    case "all":
      return { filter: notCompleted };

    case "team":
      return {
        filter: {
          and: [
            notCompleted,
            { property: "팀", select: { equals: params.teamName } },
          ],
        },
      };

    case "person":
      return {
        filter: {
          and: [
            notCompleted,
            { property: "담당자", people: { contains: params.personUuid } },
          ],
        },
      };

    case "overdue":
      // date range 필터가 start 기준일 수 있으므로,
      // 완료 제외만 필터링하고 코드에서 end(마감일) 비교
      return { filter: notCompleted };
  }
}

function parseTask(page: NotionPage): TaskItem {
  const props = page.properties;

  const titleArr = props["작업"]?.title;
  const title = titleArr?.[0]?.plain_text ?? "(제목 없음)";

  const status = props["Status"]?.status?.name ?? "알 수 없음";
  const team = props["팀"]?.select?.name ?? "-";
  const assignees = (props["담당자"]?.people ?? []).map((p) => {
    // "[박소형]모모" → "모모" 추출
    const match = p.name.match(/\](.+)$/);
    return match ? match[1] : p.name;
  });
  const priority = props["우선순위"]?.select?.name ?? "-";
  const sprint = props["Sprint"]?.select?.name ?? "-";
  const deadline = props["시작날짜 <-> Dead Line"]?.date?.end ?? null;
  const project = props["Project"]?.select?.name ?? "-";

  return {
    title,
    status,
    team,
    assignees,
    priority,
    sprint,
    deadline,
    project,
    notionUrl: page.url,
  };
}

export async function queryNotionTasks(
  env: Env,
  params: QueryParams,
): Promise<TaskItem[]> {
  const today = new Date().toISOString().split("T")[0];
  const filterBody = buildFilter(params, today);

  const body = {
    ...filterBody,
    sorts: [{ property: "우선순위", direction: "ascending" }],
    page_size: 100,
  };

  const allResults: NotionPage[] = [];
  let cursor: string | null = null;

  do {
    const requestBody: Record<string, unknown> = { ...body };
    if (cursor) requestBody.start_cursor = cursor;

    const response = await fetch(
      `${NOTION_API_BASE}/databases/${env.NOTION_DATABASE_ID}/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.NOTION_API_TOKEN}`,
          "Notion-Version": "2022-06-28",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Notion API error ${response.status}: ${errorText}`);
    }

    const data = (await response.json()) as NotionQueryResponse;
    allResults.push(...data.results);
    cursor = data.has_more ? data.next_cursor : null;
  } while (cursor);

  let tasks = allResults.map(parseTask);

  // 지연 모드: 코드에서 마감일(end) 기준 필터링
  if (params.mode === "overdue") {
    tasks = tasks.filter((t) => {
      if (!t.deadline) return false;
      return t.deadline < today;
    });
  }

  return tasks;
}
