# Data Model: Corporate Campaigns Management

## Conceptual Entities

- **Campaign** — assessment initiative owned by a company.
- **CampaignHistory** — audit entry for campaign lifecycle events.
- **AccessCode** — candidate credential tied to a campaign and quiz.
- **CompanyQuiz** — private quiz (custom or personal) owned by a company.
- **CompanyQuizQuestion** — original question for a personal company quiz.
- **CompanyQuizAnswer** — answer option for a personal company quiz question.
- **CustomQuizQuestion** — junction linking a custom company quiz to existing `Question` rows.
- **CandidateResult** — outcome of an access-code test; should store `campaignId` for fast campaign-scoped queries.

## Physical Schema Changes (Prisma Migration)

### Campaign

```prisma
model Campaign {
  id              String    @id @default(uuid()) @db.VarChar(36)
  companyId       String    @db.VarChar(36)
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

### CampaignHistory

Add `action` and `metadata` fields; keep `status` optional.

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

### AccessCode

Add `campaignId`, `sentAt`, `sentToEmail`, `maxUses`/`usedCount`.

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

### CompanyQuiz

```prisma
model CompanyQuiz {
  id          String    @id @default(uuid()) @db.VarChar(36)
  companyId   String    @db.VarChar(36)
  type        String    @db.VarChar(20) // "custom" | "personal"
  name        String    @db.VarChar(255)
  description String?   @db.Text
  status      String    @db.VarChar(20)
  createdByUserId String @db.VarChar(36)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([companyId])
  @@map("company_quizzes")
}
```

### CustomQuizQuestion

Junction for custom quizzes referencing existing questions.

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

### CompanyQuizQuestion (personal quiz)

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
```

### CompanyQuizAnswer (personal quiz)

```prisma
model CompanyQuizAnswer {
  id            String  @id @default(uuid()) @db.VarChar(36)
  companyQuizQuestionId String @db.VarChar(36)
  content       String  @db.Text
  isCorrect     Boolean
  orderIndex    Int

  @@unique([companyQuizQuestionId, orderIndex])
  @@index([companyQuizQuestionId])
  @@map("company_quiz_answers")
}
```

### CandidateResult

Add `campaignId` for direct campaign-scoped reads.

```prisma
model CandidateResult {
  id          String    @id @default(uuid()) @db.VarChar(36)
  resultCode  String    @unique @db.VarChar(255)
  campaignId  String?   @db.VarChar(36)
  candidateId String?   @db.VarChar(36)
  accessCodeId String?   @db.VarChar(36)
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

## Notes

- All new columns must be nullable or have safe defaults to preserve existing data.
- `CompanyQuiz` replaces the per-campaign quiz concept in the spec; access codes reference `quizId` which can be either a `Technology` ID (existing global quiz) or a `CompanyQuiz` ID (private quiz).
- Indexes are conservative and aimed at typical corporate-account query patterns.
