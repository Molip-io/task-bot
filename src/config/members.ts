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

// 프로젝트 별칭 → Notion DB의 실제 프로젝트명 매핑
const PROJECT_ALIAS: Record<string, string> = {
  "피자레디": "피자레디",
  "피자 레디": "피자레디",
  "my burger diner": "My Burger Diner",
  "마이버거다이너": "My Burger Diner",
  "wool arrow": "Wool Arrow",
  "울애로우": "Wool Arrow",
  "포지 앤 포춘": "포지 앤 포춘",
  "포지앤포춘": "포지 앤 포춘",
};

export function findProjectName(text: string): string | undefined {
  return PROJECT_ALIAS[text.toLowerCase()] ?? PROJECT_ALIAS[text];
}

export function isProjectName(text: string): boolean {
  return findProjectName(text) !== undefined;
}

// 닉네임 커스텀 매핑 (Notion 표시명 → 원하는 닉네임)
const NICKNAME_OVERRIDE: Record<string, string> = {
  "김홍기": "홍키",
};

// 닉네임에서 표시명 추출: "[박소형]모모" → "모모"
export function extractNickname(displayName: string | undefined): string {
  if (!displayName) return "(알 수 없음)";
  const match = displayName.match(/\](.+)$/);
  const name = match ? match[1] : displayName;
  return NICKNAME_OVERRIDE[name] ?? name;
}

export function findMemberUuid(name: string): string | undefined {
  return MEMBER_MAP[name];
}

export function isTeamName(text: string): boolean {
  return TEAM_NAMES.includes(text);
}
