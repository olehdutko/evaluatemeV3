# Data Model: Corporate Account Campaign Management

## Conceptual Entities

- **Campaign** — assessment initiative owned by a company.
- **CampaignHistory** — audit entry for campaign lifecycle events.
- **AccessCode** — candidate credential tied to a campaign and a quiz.
- **CompanyQuiz** — private quiz (custom or personal) owned by a company.
- **CustomQuizQuestion** — junction linking a custom company quiz to existing `Question` rows.
- **CompanyQuizQuestion** — original question for a personal company quiz.
- **CompanyQuizAnswer** — answer option for a personal company quiz question.
- **CandidateResult** — outcome of an access-code test; stores `campaignId` for fast campaign-scoped queries.
- **UserAnswer** — candidate's answer to a question during a session, used for scoring.
- **QuizSession** — in-progress or completed test session tied to an access code.
- **CompanyProfile** — company account record tracking access-code and test limits.

## Physical Schema (Current & Required)

The current Prisma schema already supports the feature. Only behavioral changes in use cases are required; no new tables or destructive migrations are needed. If future indexing becomes necessary, additive migrations are permitted.

### Campaign

```prisma
model Campaign {
  id              String    @id @default(uuid()) @db.VarChar(36)
  companyId       String?   @db.VarChar(36)
  name            String    @db.VarChar(255)
  description     String?   @db.Text
  notes           String?   @db.Text
  status          String    @db.VarChar(20)
  createdByUserId String    @db.VarChar(36)
  startDate       DateTime?
  endDate         DateTime?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([companyId])
  @@index([companyId, status])
  @@map("campaigns")
}
```

**Validation rules**: `status` must be one of `open`, `closed`, `archived`. `name` is required. `companyId` is required at the application level and may be made non-nullable in a future additive migration if desired.

### CampaignHistory

```prisma
model CampaignHistory {
  id              String   @id @default(uuid()) @db.VarChar(36)
  campaignId      String   @db.VarChar(36)
  action          String   @db.VarChar(50)
  status          String?  @db.VarChar(20)
  changedByUserId String   @db.VarChar(36)
  metadata        String?  @db.Text
  changedAt       DateTime @default(now())
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([campaignId])
  @@map("campaign_history")
}
```

**Validation rules**: `action` must be one of `created`, `status_changed`, `access_code_created`, `access_code_sent`. `status` is populated for `created` and `status_changed` actions. `metadata` is a JSON string carrying action-specific fields.

### AccessCode

```prisma
model AccessCode {
  id              String    @id @default(uuid()) @db.VarChar(36)
  code            String    @unique @db.VarChar(100)
  companyId       String    @db.VarChar(36)
  campaignId      String?   @db.VarChar(36)
  quizId          String?   @db.VarChar(36)
  technologyId    String?   @db.VarChar(36)
  status          String    @db.VarChar(20)
  sentAt          DateTime?
  sentToEmail     String?   @db.VarChar(255)
  usedCount       Int       @default(0)
  maxUses         Int       @default(1)
  expiresAt       DateTime?
  usedAt          DateTime?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([companyId])
  @@index([campaignId])
  @@map("access_codes")
}
```

**Validation rules**: `status` must be one of `active`, `used`, `expired`, `revoked`. `code` is globally unique. `campaignId` is required for corporate campaign codes. `quizId` identifies the quiz; `technologyId` identifies the technology for global quizzes; for company quizzes the question set is resolved from `CompanyQuiz` + junctions.

**State transitions**:

| Event | Action on access codes |
|-------|------------------------|
| Campaign created | Codes can be created |
| Campaign closed | All unsent `active` codes become `revoked`; sent codes keep current status |
| Campaign archived | All codes (`active` or `revoked`) become `revoked` |
| Campaign reopened | No automatic reactivation of previously disabled codes |
| Code sent | `sentAt` and `sentToEmail` are set; status remains `active` until used |
| Code used | `status` becomes `used`, `usedCount` increments, `usedAt` is set |

### CompanyQuiz

```prisma
model CompanyQuiz {
  id              String   @id @default(uuid()) @db.VarChar(36)
  companyId       String   @db.VarChar(36)
  type            String   @db.VarChar(20)
  name            String   @db.VarChar(255)
  description     String?  @db.Text
  status          String   @db.VarChar(20)
  createdByUserId String   @db.VarChar(36)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([companyId])
  @@map("company_quizzes")
}
```

**Validation rules**: `type` is `custom` or `personal`. `status` is managed by the application. All queries must filter by `companyId` to enforce privacy.

### CustomQuizQuestion (junction)

```prisma
model CustomQuizQuestion {
  id            String @id @default(uuid()) @db.VarChar(36)
  companyQuizId String @db.VarChar(36)
  questionId    String @db.VarChar(36)
  orderIndex    Int

  @@unique([companyQuizId, questionId])
  @@index([companyQuizId])
  @@map("custom_quiz_questions")
}
```

### CompanyQuizQuestion / CompanyQuizAnswer (personal quiz)

```prisma
model CompanyQuizQuestion {
  id            String  @id @default(uuid()) @db.VarChar(36)
  companyQuizId String  @db.VarChar(36)
  content       String  @db.Text
  type          String  @db.VarChar(20)
  orderIndex    Int
  score         Int     @default(1)

  @@unique([companyQuizId, orderIndex])
  @@index([companyQuizId])
  @@map("company_quiz_questions")
}

model CompanyQuizAnswer {
  id                    String  @id @default(uuid()) @db.VarChar(36)
  companyQuizQuestionId String  @db.VarChar(36)
  content               String  @db.Text
  isCorrect             Boolean
  orderIndex            Int

  @@unique([companyQuizQuestionId, orderIndex])
  @@index([companyQuizQuestionId])
  @@map("company_quiz_answers")
}
```

**Validation rules**: A personal quiz question must have at least two answers. At least one answer must be marked correct. `type` supports `single_choice` and `multiple_choice`.

### CandidateResult

```prisma
model CandidateResult {
  id          String    @id @default(uuid()) @db.VarChar(36)
  resultCode  String    @unique @db.VarChar(255)
  campaignId  String?   @db.VarChar(36)
  candidateId String?   @db.VarChar(36)
  accessCodeId String?  @db.VarChar(36)
  technologyId String?   @db.VarChar(36)
  companyQuizId String? @db.VarChar(36)
  score       Int?
  maxScore    Int?
  status      String    @db.VarChar(20)
  sessionId   String?   @db.VarChar(255)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([campaignId])
  @@map("candidate_results")
}
```

**Validation rules**: `campaignId` must be set for corporate results and never changes. `score` and `maxScore` are computed when the session completes.

### QuizSession & UserAnswer

Existing models remain unchanged. `QuizSession.accessCodeId` links a session to an access code. `UserAnswer` records selected answers and a boolean `isCorrect`.

### CompanyProfile

Existing model remains unchanged. `availableAccessCodes` represents the remaining budget for creating codes; the feature must also track/count total created codes for display.

## Relationships

```text
CompanyProfile 1--* Campaign
CompanyProfile 1--* AccessCode
CompanyProfile 1--* CompanyQuiz
Campaign 1--* AccessCode
Campaign 1--* CampaignHistory
Campaign 1--* CandidateResult
AccessCode 1--1 QuizSession (when started)
AccessCode 1--* CandidateResult (when completed)
CompanyQuiz 1--* CustomQuizQuestion *--1 Question (custom quiz)
CompanyQuiz 1--* CompanyQuizQuestion 1--* CompanyQuizAnswer (personal quiz)
QuizSession 1--* UserAnswer
```

## Notes

- All required tables already exist in the Prisma schema. The main design work is behavioral state transitions and queries.
- If `Campaign.companyId` is made non-nullable, it must be done via a safe additive migration with a default for existing rows or after confirming all existing rows already have a value.
- `AccessCode.status` should gain a `revoked` value if not already present in the application enums; the domain `AccessCodeStatus` enum already includes `REVOKED`.
- Candidate result scoring for partially correct answers is computed at read time from `UserAnswer` rows plus the correct answer set for each question.
