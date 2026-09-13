# Feature Specification: Corporate Account Campaign Management

**Feature Branch**: `014-corporate-account`

**Created**: 2026-09-08

**Status**: Draft

**Input**: User description: "Corporate account administrator needs to create and manage assessment campaigns, build private custom and personal quizzes, generate access codes inside open campaigns, send them to candidates by email, and review candidate test results scoped to each campaign. All campaign lifecycle actions must be logged in a visible change history."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create and manage campaigns (Priority: P1)

A corporate account administrator needs a structured way to organize recruiting or assessment activities into campaigns. Each campaign tracks its purpose, notes, and a full history of status changes so the administrator can understand what happened and when.

**Why this priority**: Campaigns are the foundational container for all other corporate assessment activities (access codes, quizzes, results). Without campaigns, the rest of the feature cannot function.

**Independent Test**: A company administrator can log in, create a new campaign with a name, optional description and notes, and see it appear in the list of open campaigns with a history entry showing the creator and timestamp.

**Acceptance Scenarios**:

1. **Given** a company administrator is authenticated, **When** they create a campaign with name and optional description/notes, **Then** the campaign is saved with a unique ID, status "open", and a history entry recording the date, time, and username of the administrator.
2. **Given** a company administrator has created one or more campaigns, **When** they view the campaigns list, **Then** they see campaigns grouped or filtered by status: open, closed, and archived.
3. **Given** campaigns exist in different statuses, **When** the administrator changes a campaign status (open → closed, closed → archived, closed → open, archived → open), **Then** the status is updated and a new history entry is recorded for that change.

---

### User Story 2 - Create access codes inside an open campaign (Priority: P1)

A corporate administrator generates access codes so candidates can take a specific quiz. Access codes are tied to a campaign, and the administrator can see which codes have been used or sent, plus remaining usage against any account limit.

**Why this priority**: Access codes are the mechanism that connects candidates to quizzes and enables result collection. This is the primary way corporate users run assessments.

**Independent Test**: An administrator can open a campaign and create multiple access codes; the codes appear in a grid inside the campaign, showing their status (created, sent, used) and remaining availability.

**Acceptance Scenarios**:

1. **Given** an open campaign exists, **When** the administrator creates an access code for a selected quiz within that campaign, **Then** the code is generated and listed under that campaign's access codes grid.
2. **Given** access codes exist, **When** the administrator views the campaign detail, **Then** they can see which codes have been sent to candidates and which have not, and which have been activated/used.
3. **Given** a company has a limit on access codes, **When** the administrator views the campaign or company dashboard, **Then** they can see how many codes have been used and how many remain available.
4. **Given** a closed or archived campaign, **When** the administrator attempts to create an access code, **Then** the system refuses and explains that the campaign must be open, and existing unsent codes are shown as inactive.

---

### User Story 3 - Build custom and personal quizzes for the company (Priority: P1)

A corporate administrator needs quizzes that belong only to their company. They can build a custom quiz by selecting questions from different technologies, or create a personal quiz by adding their own questions and marking correct answers.

**Why this priority**: Corporate users need quizzes tailored to their hiring criteria. Private company-owned quizzes protect their intellectual property and ensure content is not shared across accounts.

**Independent Test**: An administrator can create a custom quiz from existing questions across multiple technologies, and a separate personal quiz with original questions and marked correct answers. Both quizzes are visible only within the same company account.

**Acceptance Scenarios**:

1. **Given** the administrator has selected multiple existing questions from different technologies, **When** they save them as a custom quiz with a name, **Then** the quiz is stored and associated with the company account only.
2. **Given** the administrator is building a personal quiz, **When** they add questions, provide multiple possible answers per question, and mark one or more answers as correct, **Then** the quiz is saved and can be selected when creating an access code.
3. **Given** a custom or personal quiz was created by one company account, **When** an administrator of a different company searches for quizzes, **Then** they cannot see or use quizzes from the first company.

---

### User Story 4 - View candidate test results within a campaign (Priority: P1)

A corporate administrator reviews the outcomes of assessments sent to candidates. Results are grouped by the campaign in which the access code was created, and detailed result views show how the candidate performed on each question.

**Why this priority**: The core business value of the corporate feature is the ability to evaluate candidates. Administrators need clear, campaign-scoped results to make hiring decisions.

**Independent Test**: After a candidate completes a test using an access code, the administrator can open the campaign, go to "Test Results", and see the result with per-question correctness and a visual chart.

**Acceptance Scenarios**:

1. **Given** a candidate completed a test from an access code created in a campaign, **When** the administrator opens that campaign and navigates to "Test Results", **Then** the completed result appears in the list.
2. **Given** a test result exists, **When** the administrator clicks on it, **Then** they see a detailed breakdown showing each question as fully correct, incorrect, or partially correct, along with a chart summarizing the result.
3. **Given** results exist across multiple campaigns, **When** the administrator views a specific campaign, **Then** only results tied to access codes from that campaign are shown, including results from before any status change.

---

### User Story 5 - Campaign change history and audit log (Priority: P2)

A corporate administrator can review a chronological history of all actions taken on a campaign (creation, status changes, access code creation, access code sending). This improves transparency and accountability.

**Why this priority**: History provides accountability and helps administrators understand the lifecycle of a campaign. It is valuable but not required for the core workflow.

**Independent Test**: Every status change on a campaign adds a timestamped entry to the campaign's "Change History" section, visible to the administrator.

**Acceptance Scenarios**:

1. **Given** a campaign was created and later closed, **When** the administrator opens the campaign history, **Then** they see entries for creation and closure, including date, time, and username.
2. **Given** the campaign is reopened from archived status, **When** the administrator views the history, **Then** a new entry records the reopen action.
3. **Given** an access code is created within a campaign, **When** the administrator views the history, **Then** an entry records the access code creation.
4. **Given** an access code is sent to a candidate, **When** the administrator views the campaign history, **Then** an entry records the send action, including the recipient email and timestamp.

---

### Edge Cases

- What happens when a company reaches its access code limit? The system prevents creating new codes and informs the administrator how many codes have been created and how many remain, because the limit counts total created codes.
- What happens if an administrator tries to create an access code in a closed or archived campaign? The system refuses and explains that the campaign must be open.
- What happens if a candidate uses an access code from a closed campaign? Unsent codes are disabled when the campaign is closed; sent codes remain valid until used. New codes cannot be created in closed or archived campaigns.
- How does the system handle partially correct answers? Questions with multiple correct answers are scored as fully correct only if all correct answers are selected and no incorrect answers are selected. If some but not all correct answers are selected and no incorrect answers are selected, the answer is partially correct and contributes half of the question's points to the score. The detailed result breakdown labels the question as partially correct, and the result chart shows correct, incorrect, and partially correct as distinct segments.
- What happens if a quiz selected for an access code is deleted after the code is created? The system should clearly mark the access code as invalid or warn the administrator before a candidate starts the test.
- What happens to historical candidate results when a campaign is closed, archived, or reopened? Results completed at any point remain visible in the campaign's "Test Results" section regardless of current campaign status.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A company account administrator MUST be able to create a campaign with a unique ID, name, optional description, optional notes, and initial status "open".
- **FR-002**: A campaign MUST support the statuses: open, closed, and archived.
- **FR-003**: A company administrator MUST be able to view all campaigns they created, grouped or filtered by status (open, closed, archived).
- **FR-004**: A company administrator MUST be able to change an open campaign's status to closed; when this happens, all unsent access codes in that campaign MUST become inactive.
- **FR-005**: A company administrator MUST be able to change a closed campaign's status to archived or open; when a campaign is archived, all access codes in that campaign MUST become inactive. Reopening a closed or archived campaign does not automatically reactivate previously disabled codes.
- **FR-006**: A company administrator MUST be able to change an archived campaign's status to open.
- **FR-007**: Every campaign status change MUST be recorded in the campaign history with date, time, and the username of the administrator who performed the action. Sending an access code to a candidate MUST also be recorded in the campaign history with the recipient email, date, time, and username.
- **FR-008**: A company administrator MUST be able to create access codes only within open campaigns.
- **FR-009**: Access codes created within a campaign MUST be visible in a grid inside that campaign, showing whether each code has been sent, used/activated, and the remaining usage against the company limit.
- **FR-010**: If the company has an access code limit, the limit counts total created access codes; the administrator MUST see how many codes have been created and how many remain available.
- **FR-011**: A company administrator MUST be able to create a custom quiz by selecting existing questions from multiple technologies; the custom quiz MUST be accessible only within the same company account.
- **FR-012**: A company administrator MUST be able to create a personal quiz by adding original questions, providing multiple possible answers per question, and marking one or more answers as correct; the personal quiz MUST be accessible only within the same company account.
- **FR-013**: Test results from candidates who used access codes MUST be visible only within the campaign where those access codes were created; historical results remain visible even if the campaign is later closed, archived, or reopened.
- **FR-014**: A company administrator MUST be able to view a detailed test result showing each question as correct, incorrect, or partially correct, along with a visual chart summarizing the result; partially correct answers contribute half of the question's points to the total score and are shown as a separate chart segment.
- **FR-015**: A company administrator MUST be able to send access codes to candidates by email; sent codes MUST be visually marked as sent in the campaign access code grid.
- **FR-016**: A company administrator MUST be able to open any campaign they own and see its access codes, activated access codes, and associated test results.

### Key Entities *(include if feature involves data)*

- **Campaign**: Represents an organized assessment initiative. Attributes include unique ID, name, optional description, optional notes, current status (open/closed/archived), company account ownership, and a history of changes.
- **Access Code**: A single-use or limited-use credential that grants a candidate access to a specific quiz. It belongs to one campaign, has an active/inactive status, tracks whether it has been sent and used/activated, and links to candidate results. Unsent codes become inactive when the campaign is closed; all codes become inactive when the campaign is archived.
- **Custom Quiz**: A company-owned quiz built from existing questions selected from multiple technologies. It is associated with the company account only.
- **Personal Quiz**: A company-owned quiz built from administrator-created questions and answers. It is associated with the company account only.
- **Candidate Result**: The outcome of a test session started with an access code. It belongs to the campaign of that access code, contains per-question correctness (fully correct / incorrect / partially correct at half credit), and a summary score.
- **Campaign History Entry**: A log of an action performed on a campaign (creation, status change, access code creation, access code sending). It records timestamp, administrator username, and relevant metadata such as recipient email for send actions.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A company administrator can create a campaign in under 60 seconds.
- **SC-002**: 100% of campaign status changes are recorded in the campaign history within 1 second of the action.
- **SC-003**: Access codes can only be created in open campaigns; attempts in closed or archived campaigns are blocked with a clear message.
- **SC-004**: Custom and personal quizzes created by one company account are not visible or usable by any other company account.
- **SC-005**: Test results from access codes appear in the campaign "Test Results" section within 5 seconds of test completion.
- **SC-006**: 90% of administrators can locate a candidate's detailed result and identify correct, incorrect, and partially correct questions without assistance.
- **SC-007**: Campaign access code grid shows sent/used status accurately for 100% of codes.

## Clarifications

### Session 2026-09-13

- **Q**: What should happen when a campaign is closed or archived regarding existing access codes?  
  **A**: Closing a campaign disables all existing unsent codes; archived campaigns disable all codes. Codes already sent to candidates remain usable until consumed.
- **Q**: How should partially correct answers be scored and displayed?  
  **A**: Partial answers give half credit (rounded as appropriate); any non-zero partial credit is labeled "partially correct" in the breakdown and counted as a separate segment in the result chart.
- **Q**: Does the company access code limit count created codes, sent codes, or used codes?  
  **A**: The limit counts total created access codes, regardless of whether they were sent or used.
- **Q**: Should access code sending also be logged in campaign history?  
  **A**: Yes, sending an access code to a candidate is logged as a separate history entry with recipient email, timestamp, and administrator username.
- **Q**: When a campaign is reopened, should previously completed candidate results still be visible?  
  **A**: Yes, all historical results for the campaign remain visible regardless of status changes.

## Assumptions

- Corporate accounts and company administrators already exist in the system; this feature extends their capabilities rather than introducing a new account type.
- A company-level access code limit may be configured; if not configured, the default behavior allows unlimited access codes. The limit counts every access code created by the company, regardless of whether it was sent or used.
- Quizzes created within a corporate account are private to that account and are not listed in the public or personal technology catalog.
- Email sending for access codes uses the existing email infrastructure; delivery success is tracked by a "sent" flag on the access code.
- Partial correctness for a question with multiple correct answers is determined by whether the candidate selected all required correct answers and no incorrect answers.
- Candidates taking tests via access codes do not need registered accounts.
- When a campaign is closed, all unsent access codes become inactive. When a campaign is archived, all access codes become inactive. Sent codes remain valid until used.
