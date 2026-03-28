export interface NotionPerson {
  id: string;
  name: string;
  avatar_url: string | null;
}

export interface NotionDateRange {
  start: string | null;
  end: string | null;
}

export interface NotionPageProperties {
  "작업": {
    type: "title";
    title: Array<{ plain_text: string }>;
  };
  "Status": {
    type: "status";
    status: { name: string } | null;
  };
  "팀": {
    type: "select";
    select: { name: string } | null;
  };
  "담당자": {
    type: "people";
    people: NotionPerson[];
  };
  "우선순위": {
    type: "select";
    select: { name: string } | null;
  };
  "Sprint": {
    type: "select";
    select: { name: string } | null;
  };
  "시작날짜 <-> Dead Line": {
    type: "date";
    date: NotionDateRange | null;
  };
  "문서 링크": {
    type: "url";
    url: string | null;
  };
  "Branch": {
    type: "rich_text";
    rich_text: Array<{ plain_text: string }>;
  };
  "Project": {
    type: "select";
    select: { name: string } | null;
  };
}

export interface NotionPage {
  id: string;
  properties: NotionPageProperties;
  url: string;
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
  notionUrl: string;
}

export type QueryMode = "all" | "team" | "person" | "overdue";

export interface QueryParams {
  mode: QueryMode;
  teamName?: string;
  personUuid?: string;
  personName?: string;
}
