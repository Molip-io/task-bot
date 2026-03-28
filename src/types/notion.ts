export interface NotionPerson {
  id: string;
  name: string;
}

export interface NotionDateRange {
  start: string | null;
  end: string | null;
}

export interface NotionPageProperties {
  "작업": { title: Array<{ plain_text: string }> };
  "Status": { status: { name: string } | null };
  "팀": { select: { name: string } | null };
  "담당자": { people: NotionPerson[] };
  "우선순위": { select: { name: string } | null };
  "Sprint": { select: { name: string } | null };
  "시작날짜 <-> Dead Line": { date: NotionDateRange | null };
  "문서 링크": { url: string | null };
  "Branch": { rich_text: Array<{ plain_text: string }> };
  "Project": { select: { name: string } | null };
}

export interface NotionPage {
  id: string;
  properties: NotionPageProperties;
}

export interface NotionQueryResponse {
  results: NotionPage[];
  has_more: boolean;
  next_cursor: string | null;
}

export interface TaskItem {
  title: string;
  status: string;
  team: string;
  assignees: string[];
  priority: string;
  sprint: string;
  deadline: string | null;
  project: string;
  isOverdue: boolean;
}

export type QueryMode = "all" | "team" | "person" | "overdue" | "project";

export interface QueryParams {
  mode: QueryMode;
  teamName?: string;
  personUuid?: string;
  personName?: string;
  projectName?: string;
}
