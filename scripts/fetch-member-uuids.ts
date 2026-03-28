/**
 * 팀원 UUID 수집 유틸리티
 *
 * 사용법:
 *   NOTION_API_TOKEN=secret_xxx NOTION_DATABASE_ID=xxx npx tsx scripts/fetch-member-uuids.ts
 *
 * 또는 .env 파일에 환경변수를 설정한 뒤:
 *   npm run fetch-members
 */

const NOTION_TOKEN = process.env.NOTION_API_TOKEN;
const DATABASE_ID = process.env.NOTION_DATABASE_ID;

if (!NOTION_TOKEN || !DATABASE_ID) {
  console.error("환경변수를 설정하세요: NOTION_API_TOKEN, NOTION_DATABASE_ID");
  process.exit(1);
}

interface NotionPerson {
  id: string;
  name: string;
}

interface NotionPage {
  properties: {
    "담당자": { people: NotionPerson[] };
  };
}

interface NotionResponse {
  results: NotionPage[];
  has_more: boolean;
  next_cursor: string | null;
}

function extractNickname(displayName: string | undefined): string {
  if (!displayName) return "(알 수 없음)";
  const match = displayName.match(/\](.+)$/);
  return match ? match[1] : displayName;
}

async function fetchMembers() {
  const memberMap = new Map<string, string>();
  let cursor: string | undefined;

  do {
    const body: Record<string, unknown> = { page_size: 100 };
    if (cursor) body.start_cursor = cursor;

    const res = await fetch(
      `https://api.notion.com/v1/databases/${DATABASE_ID}/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${NOTION_TOKEN}`,
          "Notion-Version": "2022-06-28",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
    );

    if (!res.ok) {
      console.error(`Notion API error: ${res.status} ${await res.text()}`);
      process.exit(1);
    }

    const data = (await res.json()) as NotionResponse;

    for (const page of data.results) {
      const people = page.properties["담당자"]?.people ?? [];
      for (const person of people) {
        const nickname = extractNickname(person.name);
        if (!memberMap.has(nickname)) {
          memberMap.set(nickname, person.id);
        }
      }
    }

    cursor = data.has_more ? (data.next_cursor ?? undefined) : undefined;
  } while (cursor);

  console.log("=== 팀원 UUID 매핑 ===");
  console.log("아래 내용을 src/config/members.ts의 MEMBER_MAP에 붙여넣으세요:\n");
  console.log("export const MEMBER_MAP: Record<string, string> = {");
  for (const [name, id] of memberMap) {
    console.log(`  "${name}": "${id}",`);
  }
  console.log("};");
}

fetchMembers();
