# AI Role Division Protocol v1.0
## Division of Work between Lawyer, Advisory Agent and Implementation Agent
## 人机分工协议

**Project:** Construction Contract Intelligence Dashboard
**Repository:** `C:\Projects\construction-contract-baseline`
**Control file target path:** `project-control/05_AI_ROLE_DIVISION_PROTOCOL.md`
**Status:** Governing project-control protocol
**Purpose:** To ensure no agent both creates legal content and approves it, and that every artefact is traceable to the role that produced it.

**Version:** v1.0
**Date:** 2026-08-18

Change log:

| Date | Version | Changed by | Change summary | Reason |
|---|---|---|---|---|
| 2026-08-18 | v1.0 | Lawyer (approved) | First issue. | Two AI agents now work on the same repository; role boundaries must be explicit and machine-checkable. |

---

## 1. Purpose / 目的

This protocol allocates work between three roles and defines what each may and may not do.

```text
The Lawyer decides.
The Advisory Agent proposes.
The Implementation Agent executes and validates.
```

No role performs two of these functions on the same item in the same step.

This protocol is referenced by `00_PROJECT_RULES.md` section 14 and applies to every task in the repository.

---

## 2. Defined Roles / 角色定义

### 2.1 Lawyer / 律师

The human project owner. The only role with approval authority.

### 2.2 Advisory Agent / 咨询代理

The conversational AI working outside the repository, in the project chat interface.

The Advisory Agent has no write access to the repository. It produces drafts, structures and analysis for the Lawyer to review and forward.

Where earlier project-control files refer to `ChatGPT`, that term means the Advisory Agent.

### 2.3 Implementation Agent / 执行代理

The agentic AI working inside the repository, with file read and write access.

Where earlier project-control files refer to `Codex`, that term means the Implementation Agent. The role is defined by function, not by product name. Changing the tool does not change the rules.

---

## 3. Governing Boundary / 核心分界

```text
Work requiring legal judgement is performed by the Lawyer and the Advisory Agent.
Work whose correctness can be checked mechanically is performed by the Implementation Agent.
```

Test for allocation:

```text
If the correct result has exactly one possible answer, the Implementation Agent may produce it.
If the correct result requires choosing between two defensible answers, the Lawyer must decide.
```

Where the test is unclear, the item is escalated to the Lawyer. It is not resolved by either agent.

---

## 4. Division of Work Table / 分工表

| Stage | Advisory Agent | Implementation Agent |
|---|---|---|
| FIDIC source text | Uses extracted text only; never reproduces from memory | Extracts from the licensed source document; maintains the source layer and its status fields |
| Practice categories | Proposes, with `source_basis` | Must not create, rename or delete |
| Performance nodes | Proposes, with `source_basis` | Must not create, rename or delete |
| Clause anchor mapping | Proposes anchors and `mapping_reason` | Validates each anchor exists in the source layer; splits ranges; de-duplicates; reports failures |
| Primary / secondary paths | Assigns, with cross-link reason | Validates one primary path exists and every secondary path carries a reason |
| Clause elements | Extracts; writes `core_mechanism` and `qualifier_limitation` | Validates element type is one of the three approved types and that each element has one primary checklist question |
| Legal-effect tags | Applies; writes `tag_reason` and express-wording anchor | Validates the tag is in the approved dictionary, has a reason, and is not a withdrawn generic tag |
| Checklist questions | Drafts | Validates existence and the one-to-one relationship with the element core mechanism |
| Status fields | Sets initial values only | Validates all required status fields are present; blocks prohibited values |
| QA gates | Explains the legal meaning of each gate | Implements the gates as executable checks |
| Data structures, UI, export | States requirements | Implements |
| Project-control files | Drafts | Commits; maintains the change log; never edits supplied content |

---

## 5. Advisory Agent Rules / 咨询代理规则

### The Advisory Agent may:

1. propose structure;
2. draft execution matrices;
3. identify possible source links;
4. flag gaps and conflicts;
5. propose checklist questions;
6. mark inferred items as `needs_lawyer_review`.

### The Advisory Agent must not:

1. treat inferred nodes as approved;
2. treat inferred elements as benchmark;
3. invent tag support;
4. silently fill source gaps;
5. upgrade any item to `benchmark_ready`;
6. reproduce FIDIC source text from memory;
7. write to the repository directly;
8. approve, in the same or any later step, content it produced itself.

### Combined-role rule

Where the Advisory Agent is asked to act in an implementation capacity, or the Implementation Agent in an advisory capacity, the agent is bound by the union of both sets of prohibitions, not the intersection.

The self-approval prohibition is absolute. An agent may not generate content in one capacity and validate, approve or upgrade the status of that same content in another.

---

## 6. Implementation Agent Rules / 执行代理规则

### The Implementation Agent may:

1. create and modify files inside the authorised repository root;
2. populate tables from approved source files;
3. validate JSON and Markdown consistency;
4. split clause ranges under `00_PROJECT_RULES.md` section 13;
5. update the UI to reflect an approved execution matrix;
6. create audit and validation reports;
7. extract source text from licensed source documents.

### The Implementation Agent must not:

1. create legal analysis;
2. create, rename or delete practice categories;
3. create, rename or delete performance nodes;
4. create clause-element mappings;
5. create or apply legal-effect tags;
6. alter FIDIC source text;
7. write `lawyer_approved`;
8. write `benchmark_ready`;
9. fill in any `TBD` or empty required field;
10. resolve a conflict between project-control files;
11. modify files outside the authorised repository root;
12. bulk-rename stored identifiers or stored data values without express instruction.

### The TBD rule

An empty or `TBD` field is a reporting event, not a task. The Implementation Agent reports the location and stops. It does not infer, estimate, or complete the value, however obvious the value appears.

This rule exists because a plausible inferred value is harder to detect than a blank one.

---

## 7. Reserved Fields / 保留字段

The following values may be written only by the Lawyer, manually:

```text
lawyer_review_status: lawyer_approved
benchmark_status: benchmark_ready
```

The Implementation Agent must implement these as validation blocks. Any commit or data write containing either value that was not made by the Lawyer must fail validation and be reported.

Initial values for all new items are:

```text
lawyer_review_status: needs_lawyer_review
benchmark_status: not_benchmark_ready
```

---

## 8. Handover Format / 交接格式

### Advisory Agent to Implementation Agent

Handover is by structured artefact, not by natural-language instruction.

```text
One file per performance node, in the format of 03 section 6,
or JSON conforming to the agreed schema.
Field names must match the schema exactly.
```

The Implementation Agent's task on receipt is to ingest and validate. It is not to interpret, complete or improve.

Where a handover artefact is malformed or incomplete, the Implementation Agent reports and stops.

### Implementation Agent to Advisory Agent

Handover is by validation report.

```text
Location of each failure: file path and line number.
Nature of each failure.
No proposed correction where the correction requires legal judgement.
```

---

## 9. Escalation / 升级

The Implementation Agent must escalate to the Lawyer, and must not proceed, where:

```text
1. two project-control files conflict;
2. a required field is empty or marked TBD;
3. a proposed clause anchor does not exist in the source layer;
4. a supplied tag is not in the approved dictionary;
5. an instruction would require creating legal content;
6. an instruction would require writing a reserved field;
7. an instruction would require modifying files outside the repository root;
8. the correct result has more than one defensible answer.
```

Escalation is a report to the Lawyer. It is not a request to the Advisory Agent.

---

## 10. Audit / 审计

Every commit must be attributable to a role.

Commit messages for Implementation Agent work must state:

```text
role: implementation-agent
instruction source: [lawyer / approved handover artefact]
files affected:
validation result:
```

Where an Implementation Agent task produces a validation report, that report is committed alongside the change.

---

## 11. Precedence / 优先级

This protocol is subordinate to `00_PROJECT_RULES.md` and takes precedence over `03`, `01`, `07`, `08`, `09` and `02` on questions of role, authority and approval.

On questions of legal content and methodology, the substantive methodology files govern.
