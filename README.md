# 몰입 작업봇 (Molip Task Bot)

Slack 슬래시 커맨드(`/작업현황`)로 Notion "팀 작업 현황" DB를 조회하는 봇.
Cloudflare Workers 위에서 동작한다.

## 기술 스택

- **런타임**: Cloudflare Workers
- **프레임워크**: `slack-cloudflare-workers` (lazy listener 패턴으로 3초 타임아웃 자동 우회)
- **API**: Notion API (2022-06-28)
- **언어**: TypeScript

## 슬래시 커맨드

```
/작업현황              → 전체 진행 중/일시 정지 작업 요약
/작업현황 [이름]       → 해당 담당자 작업만 (예: /작업현황 모모)
/작업현황 [팀명]       → 해당 팀 작업만 (예: /작업현황 기획)
/작업현황 지연         → 마감일 초과 작업만
```

## 초기 설정

### 1. 의존성 설치

```bash
npm install
```

### 2. 팀원 UUID 매핑 (최초 1회)

Notion DB에서 담당자 UUID를 수집한다:

```bash
NOTION_TOKEN=secret_xxx NOTION_DATABASE_ID=xxx npm run fetch-members
```

출력된 매핑을 `src/config/members.ts`의 `MEMBER_MAP`에 붙여넣는다.

### 3. 시크릿 설정

```bash
wrangler secret put SLACK_SIGNING_SECRET
wrangler secret put SLACK_BOT_TOKEN
wrangler secret put NOTION_API_TOKEN
```

### 4. wrangler.toml 설정

`NOTION_DATABASE_ID`를 실제 DB ID로 채운다.

### 5. 배포

```bash
npm run deploy
```

배포된 URL을 Slack App의 슬래시 커맨드 Request URL에 등록:
`https://molip-task-bot.<account>.workers.dev/slack/events`

## 개발

```bash
npm run dev        # 로컬 개발 서버
npm run typecheck  # 타입 체크
npm run deploy     # 배포
```
