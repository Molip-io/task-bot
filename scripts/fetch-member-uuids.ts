/**
 * 팀원 UUID 수집 유틸리티
 *
 * 사용법:
 *   NOTION_TOKEN=secret_xxx NOTION_DATABASE_ID=xxx npx tsx scripts/fetch-member-uuids.ts
 *
 * Notion DB에서 담당자 정보를 추출하여 닉네임 → UUID 매핑을 출력한다.
 * 출력 결과를 src/config/members.ts의 MEMBER_MAP에 붙여넣으면 된다.
 */

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const DATABASE_ID = process.env.NOTION_DATABASE_ID;

if (!NOTION_TOKEN || !DATABASE_ID) {
  console.error("환경변수를 설정해주세요:");
  console.error("  NOTION_TOKEN=secret_xxx NOTION_DATABASE_ID=xxx npx tsx scripts/fetch-member-uuids.ts");
  process.exit(1);
}

interface NotionPerson {
  id: string;
  name: string;
}

interface NotionQueryResponse {
  results: Array<{
    properties: {
      "담당자": {
        people: NotionPerson[];
      };
    };
  }>;
  has_more: boolean;
  next_cursor: string | null;
}

function extractNickname(displayName: string): string {
  // "[박소형]모모" → "모모"
  const match = displayName.match(/\](.+)$/);
  return match ? match[1] : displayName;
}

async function fetchMembers() {
  const memberMap = new Map<string, string>();
  let cursor: string | null = null;

  do {
    const body: Record<string, unknown> = { page_size: 100 };
    if (cursor) body.start_cursor = cursor;

    const response = await fetch(
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

    if (!response.ok) {
      console.error(`Notion API error: ${response.status} ${await response.text()}`);
      process.exit(1);
    }

    const data = (await response.json()) as NotionQueryResponse;

    for (const page of data.results) {
      const people = page.properties["담당자"]?.people ?? [];
      for (const person of people) {
        const nickname = extractNickname(person.name);
        if (!memberMap.has(nickname)) {
          memberMap.set(nickname, person.id);
        }
      }
    }

    cursor = data.has_more ? data.next_cursor : null;
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
