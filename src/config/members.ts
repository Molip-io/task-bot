// 팀원 닉네임 → Notion User UUID 매핑
// UUID 확보: scripts/fetch-member-uuids.ts 실행 후 여기에 채워넣기
export const MEMBER_MAP: Record<string, string> = {
  "모모": "notion-user-uuid-1",
  "행크": "notion-user-uuid-2",
  "케이디": "notion-user-uuid-3",
  "버치": "notion-user-uuid-4",
  "코코": "notion-user-uuid-5",
  // scripts/fetch-member-uuids.ts 실행 결과로 교체하세요
};

// 팀명 목록
export const TEAM_NAMES = ["기획", "개발"];

// 닉네임에서 표시명 추출: "[박소형]모모" → "모모"
export function extractNickname(displayName: string): string {
  const match = displayName.match(/\](.+)$/);
  return match ? match[1] : displayName;
}

export function findMemberUuid(name: string): string | undefined {
  return MEMBER_MAP[name];
}

export function isTeamName(text: string): boolean {
  return TEAM_NAMES.includes(text);
}
