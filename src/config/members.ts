// 팀원 닉네임 → Notion User UUID 매핑
// UUID는 scripts/fetch-member-uuids.ts를 실행하여 확보한 뒤 여기에 채워 넣는다.
export const MEMBER_MAP: Record<string, string> = {
  "모모": "notion-user-uuid-1",
  "행크": "notion-user-uuid-2",
  "케이디": "notion-user-uuid-3",
  "버치": "notion-user-uuid-4",
  "코코": "notion-user-uuid-5",
  // TODO: scripts/fetch-member-uuids.ts 실행 후 실제 UUID로 교체
};

// 팀명 목록
export const TEAM_NAMES = ["기획", "개발"] as const;
export type TeamName = (typeof TEAM_NAMES)[number];

export function isTeamName(text: string): text is TeamName {
  return (TEAM_NAMES as readonly string[]).includes(text);
}

export function lookupMember(name: string): { uuid: string; name: string } | null {
  const uuid = MEMBER_MAP[name];
  if (uuid) return { uuid, name };
  return null;
}
