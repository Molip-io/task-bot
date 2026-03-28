# task-bot

Slack 슬래시 커맨드(`/작업현황`)로 Notion "팀 작업 현황" DB를 조회하는 봇.
Vercel Serverless Functions 기반.

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

### 2. Vercel 배포

```bash
npm i -g vercel
vercel login
vercel
```

### 3. 환경변수 설정 (Vercel 대시보드 또는 CLI)

```bash
vercel env add SLACK_SIGNING_SECRET
vercel env add SLACK_BOT_TOKEN
vercel env add NOTION_API_TOKEN
vercel env add NOTION_DATABASE_ID
vercel env add RESPONSE_TYPE    # "in_channel" 또는 "ephemeral"
```

### 4. 팀원 UUID 매핑

```bash
NOTION_API_TOKEN=secret_xxx NOTION_DATABASE_ID=xxx npm run fetch-members
```

출력된 매핑을 `src/config/members.ts`의 `MEMBER_MAP`에 붙여넣기 후 재배포:
```bash
vercel --prod
```

### 5. Slack Request URL 등록

배포 URL을 Slack App의 슬래시 커맨드 Request URL에 입력:
`https://<프로젝트명>.vercel.app/api/slack/events`
