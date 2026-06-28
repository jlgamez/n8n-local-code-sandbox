---
name: n8n-architect
description: Assess, design, improve, and create entire n8n workflows — covers node selection, flow patterns, error handling, sub-workflows, performance, and best practices.
---

# n8n Architect

Apply this skill when assessing, designing, improving, or creating full n8n workflows.

---

## Workflow file conventions

n8n workflows live under `n8n/workflows/`, split by deployment target:

```
n8n/workflows/
  cloud/                          # n8n Cloud (production)
    <workflow_name>/
      <workflow_name>.json        # original / v1
      <workflow_name>_v2.json     # after first review
  local/                          # self-hosted community edition
    <workflow_name>/
      <workflow_name>.json
```

- **cloud/** — workflows targeting n8n Cloud. Full feature set including `$vars` and global variables.
- **local/** — workflows targeting self-hosted n8n (community edition). `$vars` and global variables are **not available**; use environment variables or inline config instead.

**Versioning rule** — when saving a reviewed or improved workflow, never overwrite the source file:
- Source is `<name>.json` (no version suffix) → save output as `<name>_v2.json`.
- Source is `<name>_v[n].json` → save output as `<name>_v[n+1].json`.

---

## Core concepts

### Data model

Every node receives and emits an **array of items**. Each item:

```json
{
  "json": { "field": "value" },
  "binary": {},
  "pairedItem": { "item": 0 }
}
```

- `json` — the main data payload (always an object).
- `binary` — optional file attachments keyed by name.
- `pairedItem` — links the output item back to the input item that produced it (used by Merge node).

Items flow through the workflow one batch at a time. Most nodes process all items in one execution; some (HTTP Request, Send Email) iterate internally.

### Execution modes

| Mode | Behavior |
|---|---|
| **Manual** | Triggered from the editor. Gets real data. Does NOT affect production. |
| **Production** | Triggered by a live trigger. Runs without UI. Errors go to the error workflow. |
| **Test** | Runs from editor using pinned data. Useful for developing downstream nodes without re-hitting APIs. |

Always pin data on upstream nodes when developing to avoid repeated API calls.

---

## Trigger selection

| Use case | Trigger node |
|---|---|
| Scheduled jobs | Schedule (cron) |
| Webhooks from external services | Webhook |
| Polling an API | Schedule + HTTP Request |
| Email-driven | Gmail / IMAP Trigger |
| Chat / Slack | Slack Trigger |
| Database changes | Postgres / MySQL Trigger (if available), or Schedule + query |
| Manual one-shot | Manual Trigger |
| Sub-workflow called by another | Execute Workflow Trigger |

**Webhook tips:**
- Use "Respond to Webhook" node to send a custom HTTP response without blocking the workflow.
- Set the webhook to "Respond Immediately" + continue processing async for long jobs.
- Always validate the payload (If node or Code node) before processing.

---

## Node selection guide

### Data manipulation

| Task | Node |
|---|---|
| Filter items | **If** (binary split) or **Filter** (multi-condition, keeps/drops) |
| Conditional routing (>2 paths) | **Switch** |
| Merge two branches | **Merge** |
| Combine fields from two branches | **Merge** (mode: Combine) or **Code** |
| Deduplicate items | **Remove Duplicates** |
| Sort items | **Sort** |
| Limit items | **Limit** |
| Reshape / rename fields | **Edit Fields (Set)** |
| Delete fields | **Edit Fields (Set)** with "Keep Only Set" or **Remove Fields** |
| Aggregate → one item | **Summarize** or **Code** |
| Split one item → many | **Code** (return array) or **Split Out** |
| Loop over items one by one | **Loop Over Items** |

### HTTP & APIs

| Task | Node |
|---|---|
| Generic REST/GraphQL | **HTTP Request** |
| OAuth2 services | Use built-in integrations (avoids token refresh complexity) |
| Paginate automatically | HTTP Request → "Pagination" settings (cursor / offset) |
| Retry on failure | HTTP Request → "Retry on Fail" + exponential backoff |

### Storage & databases

| Task | Node |
|---|---|
| Postgres / MySQL / SQLite | Dedicated DB node — prefer parameterized queries |
| Key-value state across executions | **Redis** or a DB table |
| Files | **Read/Write Files from Disk** or cloud storage nodes |
| Spreadsheets | **Google Sheets**, **Microsoft Excel** |

### AI / LLM

| Task | Node |
|---|---|
| Chat with LLM | **AI Agent** or **Basic LLM Chain** |
| One-shot text generation | **OpenAI** / **Anthropic** message node |
| Embeddings | **Embeddings OpenAI** |
| Vector search | **Vector Store** nodes (Pinecone, Supabase, Qdrant, etc.) |
| Document Q&A | **Question and Answer Chain** |
| Structured output | Use JSON schema in the AI node's system prompt + **Structured Output Parser** |

### Utilities

| Task | Node |
|---|---|
| Pause / wait | **Wait** node (resume on webhook, date, or interval) |
| Human approval gate | **Wait** → send notification → resume via webhook |
| Datetime math | **Date & Time** node |
| Crypto / hashing | **Crypto** node |
| HTML parsing | **HTML** node (CSS selectors) |
| XML/RSS | **XML** or **RSS Feed Read** |
| Send notification | **Send Email**, **Slack**, **Telegram**, **Discord** |
| Log to console | **Code** node with `console.log()` |

---

## Workflow structure patterns

### Linear pipeline
```
Trigger → Fetch → Transform → Store → Notify
```
Best for: simple ETL, single-purpose automations.

### Fan-out then merge
```
Trigger → Split → [Branch A] ──┐
                  [Branch B] ──┤→ Merge → Continue
                  [Branch C] ──┘
```
Best for: parallel API calls, enriching data from multiple sources.

### Conditional routing
```
Trigger → Switch ──→ [Path: new_user] → Onboarding flow
                 ──→ [Path: returning] → Update flow
                 ──→ [Path: default]  → Log & skip
```
Use **Switch** over chained **If** nodes — it's cleaner and easier to extend.

### Error-recovery pattern
```
Main flow ──→ [error workflow] → Notify + log
```
Set an Error Workflow on every production workflow. The error workflow receives `$execution.error` and `$execution.workflow`.

### Sub-workflow pattern
```
Main workflow → Execute Workflow → Sub-workflow
```
Use sub-workflows to:
- Reuse logic across multiple workflows.
- Limit the size of individual workflows.
- Isolate concerns (auth refresh, formatting, notifications).

**Sub-workflow data contract:**
- Input: pass a structured item via Execute Workflow node.
- Output: sub-workflow returns items from its last node.
- Use Execute Workflow Trigger → define expected fields in the first node.

### Polling pattern (no webhook available)
```
Schedule (every 5 min) → HTTP Request → Filter (only new) → Process
```
Track the last-seen ID or timestamp in a DB / Redis key.

### Human-in-the-loop
```
Trigger → Build approval message → Slack/Email → Wait (webhook) → Branch on approval/reject
```
The Wait node's webhook URL is included in the notification. On click, the workflow resumes.

---

## Error handling

### Node-level
- Enable "Continue on Fail" only for non-critical nodes (logging, notifications).
- For critical nodes, let the error propagate — don't swallow it.
- Use "Retry on Fail" for transient failures (rate limits, timeouts).

### Workflow-level
Every production workflow should have an Error Workflow set in workflow settings. The error workflow should:
1. Extract `{{ $execution.error.message }}` and `{{ $execution.workflow.name }}`.
2. Send a Slack/email alert with context.
3. Optionally write to a `workflow_errors` table.

```
Error trigger → Format message → Slack alert → Write to DB
```

### Try/catch with Code node
For fine-grained error handling inside a Code node:

```js
try {
  const result = riskyOperation();
  return [{ json: { success: true, result } }];
} catch (err) {
  return [{ json: { success: false, error: err.message } }];
}
```

Then use an **If** node downstream to route on `success`.

---

## Performance

### Batch processing
- Use **Loop Over Items** when an API has per-item rate limits.
- Set batch size to stay within the API's rate limit (e.g., 10 items per second).
- Add a **Wait** node inside the loop if needed: `Wait → 1 second → continue`.

### Avoid fan-out storms
Don't split 10,000 items and make an API call per item in parallel. Instead:
1. Chunk with **Loop Over Items** (batch size 50–100).
2. Use HTTP Request's built-in batching if available.

### Pinned data in development
Pin output on stable upstream nodes. This avoids re-triggering APIs/databases on every test run.

### Sub-workflow parallelism
n8n doesn't parallelize within a single workflow execution (nodes run sequentially per batch). For true parallelism, call sub-workflows asynchronously:
- Execute Workflow → set "Wait for sub-workflow" to false.

---

## Code nodes in workflows

When a workflow requires a Code node, apply the `/n8n-coder` skill guidelines for structure, patterns, and clean code rules (return format, no mutation, early destructuring, etc.).

One important difference from the sandbox: in actual n8n workflow JSON, Code node scripts use `return result` — **not** `console.log`. The `console.log` convention is sandbox-only and must not appear in workflow files.

---

## Data transformation best practices

### Use Edit Fields (Set) for simple remapping
Prefer **Edit Fields (Set)** over Code for renaming/adding fields. It's visible at a glance in the UI and doesn't require reading code.

### Use Code node for complex logic
Reach for the Code node when:
- You need `.filter()`, `.reduce()`, `.map()` across all items.
- Conditional field construction is complex.
- You need to aggregate items into one.

### Expression syntax quick reference

| Task | Expression |
|---|---|
| Access current item field | `{{ $json.fieldName }}` |
| Previous node output | `{{ $('Node Name').item.json.field }}` |
| All items from a node | `{{ $('Node Name').all() }}` |
| Today's date | `{{ $now.toISO() }}` |
| Format date | `{{ $now.format('yyyy-MM-dd') }}` |
| Env variable | `{{ $env.MY_VAR }}` |
| Workflow variable | `{{ $vars.MY_VAR }}` |
| Conditional (ternary) | `{{ $json.active ? 'yes' : 'no' }}` |
| Nullish coalescing | `{{ $json.name ?? 'Unknown' }}` |
| String interpolation | `{{ 'Hello ' + $json.name }}` |

n8n expressions use **Luxon** for dates and standard JS for everything else.

---

## Credentials & security

- Never hardcode secrets in expressions or Code nodes — use **Credentials** or `$env`/`$vars`.
- For API keys, create a custom credential type or use the "Header Auth" / "Query Auth" credential.
- Scope credentials: don't share one "admin" credential across workflows. Use least-privilege API keys.
- Use `$env` for environment-specific config (base URLs, feature flags). Set in n8n's environment variables or `.env`.
- Rotate credentials via the Credentials panel — workflows automatically pick up the new value.

---

## Workflow organization

### Naming conventions
- Workflows: `[Domain] Verb Object` — e.g., `[CRM] Sync Contacts to HubSpot`
- Nodes: verb + noun — e.g., `Fetch Orders`, `Filter Active Users`, `Send Slack Alert`
- Sub-workflows: prefix with `[Sub]` — e.g., `[Sub] Format Invoice`

### Tagging & folders
Group workflows by domain (CRM, Finance, DevOps) using n8n's folder/tag system. Makes it easy to find related workflows and assess blast radius of changes.

### Documentation
- Add a **Sticky Note** node at the top of every workflow with: purpose, trigger frequency, owner, last modified.
- Add Sticky Notes near complex logic blocks explaining the "why".

### Version control
Export workflows as JSON and commit to a git repo. Use n8n's built-in GitHub/GitLab integration (n8n Cloud) or the `n8n export:workflow` CLI command.

---

## Assessing an existing workflow

When asked to review or improve a workflow, check these areas:

1. **Error handling** — Is there an error workflow? Do critical nodes have retries?
2. **Credential hygiene** — Are secrets hardcoded? Are credentials scoped correctly?
3. **Data validation** — Is incoming data validated before processing (webhook payloads, API responses)?
4. **Fragile expressions** — Are there `$json.a.b.c` chains without null checks? Use `?.` or add an If guard.
5. **Performance** — Are there unbounded loops, N+1 API calls, missing pagination?
6. **Naming clarity** — Can you understand what each node does from its label?
7. **Reusability** — Is logic duplicated across workflows that could be a sub-workflow?
8. **Trigger safety** — Could the trigger fire more than expected (no dedup, no idempotency)?
9. **Output contracts** — Does the last node always emit a consistent shape?
10. **Observability** — Is there logging/alerting for failures? Is there a way to replay failed executions?

---

## Common anti-patterns

| Anti-pattern | Fix |
|---|---|
| Long chain of If nodes | Use Switch node |
| Code node doing HTTP calls (`fetch`) | Use HTTP Request node — it handles auth, retries, and logging |
| Hardcoded URLs/keys in expressions | Move to `$env` or credentials |
| One massive workflow with 50+ nodes | Split into focused sub-workflows |
| No error workflow set | Add one — minimum: Slack alert + log |
| `$json` in a multi-item context | Use `$input.all()` in Code, or `$('Node').item.json` in expressions |
| Polling every minute when a webhook is available | Use the webhook — polling burns execution quota |
| Storing state in workflow static data | Use Redis or a DB — static data is unreliable in queue mode |

---

## Designing a new workflow: checklist

1. **Trigger**: What starts this? Manual, schedule, webhook, event?
2. **Input shape**: What data comes in? Validate it upfront.
3. **Happy path**: Sketch the nodes for the main success case.
4. **Edge cases**: Empty input, missing fields, API failures — how does each branch behave?
5. **Output**: Where does data land? DB write, API call, notification, sub-workflow output?
6. **Error workflow**: Set one. Minimum viable: alert + log.
7. **Idempotency**: If the workflow runs twice on the same input, is that safe? If not, add a dedup check.
8. **Rate limits**: Does the workflow respect the rate limits of downstream APIs?
9. **Testing**: Pin data on the trigger. Test each branch manually before activating.
10. **Naming & notes**: Label all nodes. Add a Sticky Note with purpose and owner.
