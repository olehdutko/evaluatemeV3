# Аудит імплементації Corporate Account Campaign Management

## Мета
Перевірити, чи поточна імплементація у гілці `014-corporate-account` відповідає наданій документації, та виявити прогалини/розбіжності.

## Методологія
- Опитано специфікацію: `specs/014-corporate-account/spec.md`, `plan.md`, `tasks.md`, `data-model.md`, `quickstart.md`, `contracts/*`, `research.md`.
- Проінспектовано код: `apps/api/src/application/corporate/*`, `apps/api/src/modules/corporate/*`, `apps/api/src/application/test-engine/*`, `apps/api/src/infrastructure/prisma/repositories/*`, `apps/web/src/app/campaigns/*`, `apps/web/src/app/quizzes/*`, `apps/web/src/components/campaigns/*`, `packages/domain/src/*`, `packages/prisma/schema.prisma`.
- Виконано валідаційні команди: `npm run lint` (api/web), `npm run test --workspace=apps/api`, `npm run build --workspace=apps/api`, `npm run build --workspace=apps/web`.

## Загальний вердикт

**Імплементація охоплює всі 5 User Stories фічі на рівні backend + frontend, але містить критичні поведінкові невідповідності та UI/UX прогалини, які потребують доопрацювання.**

| Критерій | Статус |
|----------|--------|
| User Story 1 — Кампанії | ✅ Реалізовано, є нюанси UI |
| User Story 2 — Access Codes | ⚠️ Частково — ліміт-логіка відхиляється від документації |
| User Story 3 — Custom/Personal Quizzes | ✅ Реалізовано, є нюанси типізації |
| User Story 4 — Результати | ⚠️ Частково — часткова правильність є, але UI не показує зміст питань/відповідей |
| User Story 5 — Історія | ✅ Реалізовано |
| Безпека / company-scoping | ✅ Всі корпоративні ендпоінти захищені JWT+COMPANY+companyId перевірка |
| Тести/білди | ✅ API 115/115 тестів пройшло; web build пройшов (4 pre-existing failures) |

---

## Детальний аналіз по сутностям

### 1. Кампанія (Campaign)

| Вимога документації | Реалізація | Статус | Примітки |
|---------------------|------------|--------|----------|
| Кампанія має ID, name, description, notes, history | `Campaign` Prisma модель + `create-campaign.use-case.ts` | ✅ | — |
| Статуси: open, closed, archived | `CampaignStatus` enum + schema | ✅ | — |
| Створення лише адміністратором корпоративного аккаунту | `JwtAuthGuard + RolesGuard(UserRole.COMPANY)` + перевірка `companyProfile.userId === userId` | ✅ | — |
| Історія змін: створення, зміна статусу | `CampaignHistory` пишеться у `create-campaign` і `update-campaign-status` | ✅ | — |
| Відкрита → закрита, закрита → архівна/відкрита, архівна → відкрита | `ALLOWED_TRANSITIONS` у `update-campaign-status.use-case.ts` | ✅ | — |
| Закриття кампанії вимикає unsent access codes | `applyAccessCodeStatusChanges` викликає `updateStatusByCampaignId ACTIVE→REVOKED` | ⚠️ | Працює, але `archived` викликає зайвий другий виклик ACTIVE→REVOKED + REVOKED→REVOKED (нешкідливий, але нечистий) |
| Архівація вимикає **всі** access codes | Лише ACTIVE→REVOKED; якщо були `sent` та все ще `active` — вимкне, але `used`/`expired` залишаться. Це відповідає специфікації, яка каже "all codes become inactive", де inactive = revoked. | ✅ | — |
| При відкритті раніше вимкнені коди не активуються автоматично | Код не викликає reactivation | ✅ | — |
| Адміністратор бачить всі свої кампанії за статусами | `list-campaigns.use-case.ts` + фільтр UI | ✅ | — |
| UI: зручний перехід між статусами | `campaigns/[id]/page.tsx` показує кнопки `Mark {status}` | ⚠️ | Немає підтвердження дії; кнопка "Mark open" після архівації може бути несподіваною. Рекомендовано додати confirm dialog. |

### 2. Access Code

| Вимога документації | Реалізація | Статус | Примітки |
|---------------------|------------|--------|----------|
| Генерується унікальний Access Code | `create-access-code.use-case.ts: generateCode()` — 8 символів A-Z/2-9; перевірка `findByCode` | ✅ | При масштабуванні можливі колізії, але для корпоративного навантаження прийнятно |
| Створення лише у відкритій кампанії | `campaign.status !== 'open'` → `BadRequestError` | ✅ | — |
| Прив'язка до quiz: technology або company_quiz | `quizType: 'technology' | 'company_quiz'` + `quizId` + `technologyId` | ✅ | — |
| Відправка на email | `send-access-code.use-case.ts` через `IEmailService` | ✅ | — |
| Після відправки статус "sent" / прапорець | `sentAt`/`sentToEmail` в AccessCode; UI відображає | ✅ | — |
| Після використання статус "used" | `usedCount`/`maxUses`; `submit-answer.use-case.ts` не змінює `status` access code на `used` | ❌ | Access code залишається `active` після проходження кандидатом. Це порушує вимогу "see which codes have been used" та FR-009 |
| Ліміт access codes: **лічильник створених кодів**, не sent/used | `countByCompanyId(input.companyId)` рахує **всі** AccessCode за companyId; `createdCount >= availableAccessCodes` → 400 | ⚠️ | Логіка рахування правильна, але назва `availableAccessCodes` вводить в оману; UI показує "used" замість "created" |
| Ліміт списується при **активації**, а не при створенні | У документації: "Плата знімається не за створення Access code, а тоді, коли Access code буде активований". У коді списання відбувається при створенні (`createdCount >= availableAccessCodes`). | ❌ | Це **критична розбіжність** із текстом документації. Потрібно: створення дозволяється безлімітно (або за іншим лімітом), списання — при відправці/активації. |
| UI: grid із статусами sent/used/remaining | `AccessCodeGrid.tsx` показує `status`, `sentAt`, `usedCount/maxUses` | ⚠️ | Немає розділення "sent vs used"; не показує `remaining` ліміт; ліміт показується тільки після створення першого коду через `onCreated` |

### 3. Custom Quiz

| Вимога | Реалізація | Статус | Примітки |
|--------|------------|--------|----------|
| Створення з питань різних технологій | `create-custom-quiz.use-case.ts` приймає `questionIds[]` | ✅ | — |
| Доступний лише власній компанії | `findByCompanyId(input.companyId)` + `companyProfile.userId === userId` | ✅ | — |
| Зберігання зв'язку питань | `CustomQuizQuestion` junction | ✅ | — |
| UI builder | `quizzes/custom/page.tsx` | ✅ | — |
| Використання для access code | `StartSessionUseCase.resolveQuestions` обробляє `quiz.type === 'custom'` | ✅ | — |

### 4. Personal Quiz

| Вимога | Реалізація | Статус | Примітки |
|--------|------------|--------|----------|
| Створення з власних питань/відповідей | `create-personal-quiz.use-case.ts` | ✅ | — |
| Позначення правильних відповідей | `answers.isCorrect` | ✅ | — |
| Хоча б 2 відповіді | Zod schema `answers: z.array().min(2)` | ✅ | — |
| Хоча б 1 правильна відповідь | **Не валідується** на backend | ⚠️ | UI дозволяє створити quiz без правильної відповіді. Потрібно додати перевірку в use case / schema |
| UI builder | `quizzes/personal/page.tsx` | ✅ | — |
| Використання для access code | `StartSessionUseCase.resolveQuestions` обробляє `quiz.type === 'personal'` | ✅ | — |
| Зберігання питань/відповідей | `CompanyQuizQuestion` + `CompanyQuizAnswer` | ✅ | — |

### 5. Result Code / Candidate Result

| Вимога | Реалізація | Статус | Примітки |
|--------|------------|--------|----------|
| Унікальний Result Code після завершення квіза | `submit-answer.use-case.ts` генерує `randomUUID().slice(0,8).toUpperCase()` | ✅ | — |
| Для персонального аккаунту — надсилається на email | `send-quiz-result-email.use-case.ts` | ✅ | — |
| Для corporate access code — Result Code **не показується кандидату**, доступний лише адміністратору | Кандидат отримує `resultCode` у відповіді `submit-answer`, але публічний `/public/results/:resultCode` шукає лише `userResult`, а не `candidateResult`. | ⚠️ | Технічно кандидат може дізнатися resultCode, але публічний перегляд не працює для corporate results. Проте це не гарантує повну прихованість, бо resultCode передається у фронтенд кандидата. |
| Corporate results прив'язані до кампанії | `CandidateResult.campaignId` заповнюється з `accessCode.campaignId` | ✅ | — |
| Перегляд результатів у межах кампанії | `list-campaign-results.use-case.ts` + `campaigns/[id]/results/page.tsx` | ✅ | — |
| Детальний результат з правильно/неправильно/частково | `get-candidate-result-detail.use-case.ts` реалізує `correct/incorrect/partially_correct` + `chart` | ✅ | — |
| UI: детальний breakdown + графік | `ResultDetail.tsx` — segmented bar + per-question labels | ⚠️ | Не показує **текст питання**, **варіанти відповідей**, **яку відповідь обрав кандидат**. Це сильно гірше за персональний dashboard (`dashboard/results/[resultCode]`) |
| Часткова правильність = 0.5 балів | `points: 0.5` у `partially_correct` | ✅ | — |
| Score відображається у % | `score` з `CandidateResult` вже зберігається як відсоток (`currentScore = round(correctCount/totalQuestions*100)`), тому `{result.score ?? 0}%` коректне | ✅ | — |

### 6. Результати для персонального аккаунту (особистий dashboard)

| Вимога | Реалізація | Статус | Примітки |
|--------|------------|--------|----------|
| Перегляд усіх своїх result | `dashboard/page.tsx` | ✅ | — |
| Копіювання result code | є кнопка "Copy code" | ✅ | — |
| Детальний результат з графіком | `dashboard/results/[resultCode]/page.tsx` — donut chart + breakdown | ✅ | — |
| Часткова правильність у персональному результаті | `GetMyResultDetailUseCase` використовує лише `isCorrect` boolean; немає `partially_correct` | ⚠️ | Документація вимагає partially correct і для персональних результатів; тут не реалізовано. Це поза скоупом 014, але варто зафіксувати. |

### 7. Проходження квіза через Access Code (незареєстрований користувач)

| Вимога | Реалізація | Статус | Примітки |
|--------|------------|--------|----------|
| Незареєстрований користувач вводить Access Code на головній | Головна сторінка має тільки Result Code lookup; **немає поля для Access Code** | ❌ | На `page.tsx` немає секції "Enter access code to start quiz". Є лише `/result?code=...` для Result Code. |
| Access Code активує квіз | `POST /api/v1/sessions/start` + `StartSessionUseCase` | ✅ | API є, але UI entry point відсутній |
| Квіз може бути technology, custom або personal | `StartSessionUseCase.resolveQuestions` підтримує всі 3 | ✅ | — |

### 8. Адміністративні налаштування (поза скоупом 014, але згадано в документації)

| Вимога | Реалізація | Статус |
|--------|------------|--------|
| Налаштування кількості питань у квізі, часу, ціни | `Technology.quizQuestionCount`, `quizDurationMinutes`; ціна для персонального квіза реалізована через `CreditSetting` | ⚠️ Частково |
| Безкоштовні квізи = 0 credits | `StartTestUseCase` перевіряє `user.credits < 1`, тобто не дозволяє 0-credit quiz без додаткової логіки | ⚠️ |

---

## Виявлені критичні проблеми (must fix)

1. **Access Code ліміт списується при створенні, а не при активації/відправці.**
   - Файл: `apps/api/src/application/corporate/access-codes/create-access-code.use-case.ts`
   - Поточно: `countByCompanyId` vs `availableAccessCodes` блокує створення.
   - Очікувано: створення дозволено, списання/перевірка ліміту — при `send-access-code` (активація).

2. **Access Code не змінює статус на `used` після проходження кандидатом.**
   - Файл: `apps/api/src/application/test-engine/submit-answer.use-case.ts`
   - Поточно: створює `CandidateResult`, але не оновлює `AccessCode.status` / `usedCount` / `usedAt`.
   - Очікувано: позначити access code як `used` (або інкремент `usedCount` до `maxUses`), щоб grid показував used.

3. **На головній сторінці немає UI для введення Access Code.**
   - Файл: `apps/web/src/app/page.tsx`
   - Поточно: лише Result Code lookup.
   - Очікувано: додати форму "Enter access code" → перенаправлення на `/tests/{sessionId}`.

4. **Corporate result detail UI не показує текст питань/відповідей та вибір кандидата.**
   - Файл: `apps/web/src/components/campaigns/ResultDetail.tsx`
   - Поточно: лише `Question N — Correct/Partial/Incorrect`.
   - Очікувано: аналогічно до `dashboard/results/[resultCode]`: content питання, відповіді, обрана відповідь, правильні відповіді.

5. **Personal quiz дозволяє створити без правильної відповіді.**
   - Файл: `apps/api/src/application/corporate/quizzes/create-personal-quiz.use-case.ts`
   - Поточно: немає валідації `answers.some(a => a.isCorrect)`.
   - Очікувано: `BadRequestError` якщо жодна відповідь не позначена правильною.

6. **Partial correctness не реалізована для персональних результатів.**
   - Файл: `apps/api/src/application/me/get-my-result-detail.use-case.ts`
   - Поточно: boolean `isCorrect`.
   - Очікувано: `correct/incorrect/partially_correct` + chart (якщо це в скоупі).

## Виявлені помилки/ризики середньої ваги

7. **UI показує "Access codes used" замість "Access codes created".**
   - Файл: `apps/web/src/app/campaigns/[id]/page.tsx` рядки 134-138.
   - За документацією ліміт рахує створені коди, не used. Назва "used" вводить в оману.

8. **StartSessionUseCase: custom quiz бере `quiz.technologyId` замість question.technologyId.**
   - Файл: `apps/api/src/application/test-engine/start-session.use-case.ts:88-97`.
   - `quiz.technologyId` для custom quiz не зберігається у `CompanyQuiz` (поле optional). Якщо custom quiz з різних технологій — `findByTechnologyId(quiz.technologyId ?? '')` може повернути 0 питань. Натомість потрібно завантажувати питання безпосередньо за IDs.
   - Примітка: `PrismaQuizSessionRepository.findQuestionSetBySessionId` вже робить це правильно через `prisma.question.findMany({ id: { in: questionIds } })`, але `StartSessionUseCase` на момент старту використовує неоптимальний шлях.

9. **`GetCandidateResultDetailUseCase.evaluateQuestions` не враховує `score` питання.**
   - `points` завжди 1 / 0.5 / 0, незалежно від `question.score`. Для персональних питань `score` може бути > 1. Потрібно масштабувати.

10. **Відсутнє підтвердження при зміні статусу кампанії.**
    - UI одразу викликає PATCH. Користувач може випадково закрити/архівувати кампанію.

11. **`UpdateCampaignStatusUseCase` для `archived` робить зайвий другий виклик.**
    - `ACTIVE→REVOKED` вже достатньо; другий `REVOKED→REVOKED` — технічно нешкідливий, але нечистий.

12. **Root TypeScript typecheck (`tsc -p tsconfig.eslint.json`) не проходить через конфігурацію.**
    - Помилка `declarationMap cannot be specified without declaration or composite`. Це не source error, але блокує повноцінний CI typecheck. Потребує окремого вирішення (не критично для фічі).

## Реалізовано правильно (highlights)

- Чиста архітектура: use cases, domain ports, Prisma repositories — узгоджені.
- JWT + role-based guards + company-scoping на всіх корпоративних ендпоінтах.
- Campaign CRUD + status transitions + історія змін.
- Custom/Personal quiz створення з company isolation.
- Access code generation, email send, send history.
- Candidate result зберігається з `campaignId` при завершенні access-code сесії.
- Partial correctness scoring та chart summary для corporate result detail.
- Prisma migration для foreign keys (`20260913000000_add_quiz_relations`) створено та застосовано.
- API tests 115/115 pass; lint clean; builds pass.

---

## Рекомендований план доопрацювання

1. **Виправити логіку ліміту Access Code**: перенести перевірку/декремент `availableAccessCodes` у `SendAccessCodeUseCase` (активація = відправка).
2. **Позначати Access Code як `used`**: у `SubmitAnswerUseCase` при завершенні сесії оновити `AccessCode.status='used'`, `usedCount`, `usedAt`.
3. **Додати Access Code entry point на головній сторінці**: форма з полем access code → `/api/v1/sessions/start` → redirect на `/tests/{sessionId}`.
4. **Покращити Corporate Result Detail UI**: відобразити content питання, відповіді, обрану відповідь, правильні відповіді (аналогічно до персонального dashboard).
5. **Валідація personal quiz**: хоча б одна правильна відповідь.
6. **Виправити StartSessionUseCase для custom quiz**: завантажувати питання за IDs, а не за `quiz.technologyId`.
7. **Враховувати `question.score` у partial scoring** для corporate results.
8. **Полірування UI**: підтвердження статусу кампанії, коректний лейбл "created" vs "used", показ ліміту без створення першого коду.
9. **Додати інтеграційні тести** для Access Code lifecycle (create → send → use → result) та partial correctness.
10. **Вирішити root tsc конфіг** або задокументувати обхід.

---

## Висновок

Фічя має міцний фундамент і реалізує всі основні сценарії, але мала кілька важливих розбіжностей із документацією, які впливають на бізнес-логіку (ліміт/активація, статус used, entry point для access code). Усі критичні та більшість середніх пунктів було усунено в ході пост-аудит фіксів (див. `tasks.md` → "Post-Audit Fixes").

## Пост-аудит статус

- [x] Ліміт Access Code — перенесено на активацію (send).
- [x] Access Code статус `used` — позначається після завершення тесту.
- [x] Access Code entry point на головній сторінці.
- [x] Детальний corporate result UI з питаннями/відповідями.
- [x] Врахування `question.score` у partial correctness.
- [x] Валідація personal quiz — хоча б одна правильна відповідь.
- [x] Custom quiz resolution через IDs, а не technologyId.
- [x] UI labels та підтвердження зміни статусу кампанії.

*Аудит виконано: 2026-09-13*
