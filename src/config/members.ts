// 팀원 닉네임 → Notion User UUID 매핑
// UUID 확보: scripts/fetch-member-uuids.ts 실행 후 여기에 채워넣기
export const MEMBER_MAP: Record<string, string> = {
  "제이": "d1b6308f-7b6b-4314-9468-c0baadbfeb15",
  "써치": "10bd872b-594c-814f-87c4-0002daf1f537",
  "케빈": "113d872b-594c-8133-80c0-000298e11479",
  "스탠다드": "150d872b-594c-81b5-869a-00025720b7b4",
  "행크": "191d872b-594c-818d-b60e-0002a933cb46",
  "모모": "261d872b-594c-813b-a1b7-000289191dd8",
  "루아": "24cd872b-594c-8198-b206-0002689feeb1",
  "하티": "1ded872b-594c-813a-adc8-0002ebd33385",
  "브루노": "25ad872b-594c-81d2-a793-0002ca780ee1",
  "모딘": "256d872b-594c-8135-bdbc-00024f813865",
  "웨이드": "25ad872b-594c-8124-960d-000240131500",
  "지텐": "261d872b-594c-816f-b6c2-0002ff413d57",
  "케이디": "191d872b-594c-813e-9723-00024103aa81",
  "라이키": "299d872b-594c-8153-afc6-00027b916fb0",
  "바트": "107d872b-594c-8191-93c8-0002b124b212",
  "시안": "2bcd872b-594c-81c6-b2a9-0002fe74875a",
  "홍키": "2e9d872b-594c-8178-95fe-0002ecb016cf",
  "트리사": "2edd872b-594c-81df-b953-000205abb36e",
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
