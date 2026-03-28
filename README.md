# task-bot

Slack 슬래시 커맨드(`/작업현황`)로 Notion "팀 작업 현황" DB를 조회하는 봇.
Cloudflare Workers + `slack-cloudflare-workers` 기반.

## 사용법

```
/작업현황              → 전체 진행 중/일시 정지 작업 요약
/작업현황 [이름]       → 해당 담당자 작업만 (예: /작업현황 모모)
/작업현황 [팀명]       → 해당 팀 작업만 (예: /작업현황 기획)
/작업현황 지연         → 마감일 초과 작업만
```

## 초기 세팅

### 1. 의존성 설치

```bash
npm install
```

### 2. 시크릿 설정

```bash
wrangler secret put SLACK_SIGNING_SECRET
wrangler secret put SLACK_BOT_TOKEN
wrangler secret put NOTION_API_TOKEN
```

### 3. wrangler.toml에 Notion DB ID 입력

```toml
[vars]
NOTION_DATABASE_ID = "<32자리 DB ID>"
```

### 4. 팀원 UUID 매핑

```bash
NOTION_API_TOKEN=secret_xxx NOTION_DATABASE_ID=xxx npm run fetch-members
```

출력된 매핑을 `src/config/members.ts`의 `MEMBER_MAP`에 붙여넣기.

### 5. 배포

```bash
npm run deploy
```

배포된 URL을 Slack App의 슬래시 커맨드 Request URL에 등록:
`https://molip-task-bot.<account>.workers.dev/slack/events`
