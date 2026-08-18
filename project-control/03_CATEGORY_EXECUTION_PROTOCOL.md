# Category Execution Protocol v1.0  
## Main Category Execution Protocol for Construction Contract Intelligence Dashboard  
## 主类别执行协议

**Project:** Construction Contract Intelligence Dashboard  
**Repository:** `C:\Projects\construction-contract-baseline`  
**Control file target path:** `project-control/03_CATEGORY_EXECUTION_PROTOCOL.md`  
**Status:** Governing project-control protocol; not an execution matrix  
**Purpose:** To ensure every main category is executed consistently, traceably, reviewably, and later updatable.

**Version:** v1.0
**First committed to repository:** 2026-08-18
**Governing status:** Referenced by `00_PROJECT_RULES.md` section 14. Effective from first commit.

Change log:

| Date | Version | Changed by | Change summary | Reason |
|---|---|---|---|---|
| 2026-08-18 | v1.0 | Lawyer (approved) | First commit to repository. Content unchanged from approved draft. | File previously existed only outside the repository and was therefore not binding on the Implementation Agent. |

---

## 1. Purpose / 目的

This protocol governs how each approved main category is converted from methodology into a traceable execution matrix.

The protocol applies to the legal team, ChatGPT, Codex, and future reviewers or data updaters.

Core distinction:

```text
Methodology explains how to classify.
Execution file records what has actually been classified.
```

This protocol must be followed before creating, revising, auditing, or implementing any category execution matrix.

---

## 2. Approved Main Categories / 已批准主类别

All category execution work must use the following seven approved top-level main categories.

| No. | Chinese | English |
|---:|---|---|
| 1 | 工程范围与界面 | Scope & Interface |
| 2 | 时间 | Time |
| 3 | 付款与对价 | Payment & Price |
| 4 | 风险分配 | Risk Allocation |
| 5 | 责任与救济 | Liability & Remedies |
| 6 | 索赔与争议 | Claims & Disputes |
| 7 | 合同螺丝钉 | Contract Mechanics |

Do **not** substitute different top-level category labels unless expressly approved.

Deprecated as standalone top-level labels unless expressly approved:

```text
Scope & Works
Time & Completion
Price & Payment
Suspension & Termination
Testing / Taking Over / Defects
Contract Administration
Default / Termination
```

These concepts may still appear as practice categories, performance nodes, cross-links, or issue labels under the approved seven categories where appropriate.

---

## 3. Governing Hierarchy / 系统层级

The dashboard uses this hierarchy:

| Level | Name | Function |
|---|---|---|
| Level 1 | Main Category / 主类别 | One of the seven approved top-level categories |
| Level 2 | Practice Category / 实务分类 | Practice-based grouping under the main category |
| Level 3 | Performance Node / 履约节点 | Recurring construction contract issue or mechanism |
| Level 4 | FIDIC Clause / Sub-Clause / 条款锚点 | Concrete source clause anchor |
| Below Clause | Clause Elements / Tags / Source Text / Status | Functional mechanisms, legal effects, source traceability, review status |

Core direction:

```text
Construction contract practice logic
→ practice category
→ performance node
→ FIDIC clause anchor
→ clause element
→ legal-effect tag
→ source text verification
→ checklist comparison use
```

FIDIC is the **source layer / baseline**, not the dashboard classification logic itself.

---

## 4. Source Hierarchy / 来源优先级

For each main category, use sources in this order.

### Tier 1 — User-approved practice logic

This is the primary source for practice categories and performance nodes.

Examples:

```text
mindmap
user-confirmed category logic
user-approved performance nodes
existing lawyer notes
approved project-control files
```

### Tier 2 — FIDIC source text

This is the source for clause anchors, element wording, tag support, and qualifier / limitation support.

Examples:

```text
FIDIC 2017 Red Book clause number
clause title
full clause text
sub-clause structure
defined terms
express wording
```

### Tier 3 — Approved methodology

This controls the method of execution, but does not create legal content.

Examples:

```text
overall dashboard methodology
element methodology
tag dictionary
Clause Spine rules
primary / secondary mapping rules
category execution protocol
```

### Tier 4 — Methodology inference

Inference is allowed only as a temporary drafting aid.

Any inferred item must be marked:

```text
source_basis_status: methodology_inferred
lawyer_review_status: needs_lawyer_review
benchmark_status: not_benchmark_ready
```

Inferred items must not be treated as approved, final, or benchmark-ready.

---

## 5. Mandatory Workflow / 必须执行流程

The workflow below applies to every main category.

### Step 0 — Pre-check

Before working on any category, confirm:

1. the selected main category is one of the seven approved main categories;
2. the applicable methodology files have been read;
3. source materials are available;
4. any mindmap or user-approved practice structure has been identified;
5. FIDIC source text is loaded or the missing source status is known;
6. the tag dictionary is current;
7. the category execution file target name is confirmed.

Do not start execution if the category name is not one of the seven approved main categories.

---

### Step 1 — Define Practice Categories

Define Level 2 practice categories for the selected main category.

Rules:

1. Practice categories must be based on construction contract practice logic.
2. Do not copy the FIDIC table of contents.
3. Do not create a practice category merely because FIDIC has a clause heading.
4. Each practice category must be supported by mindmap, user instruction, existing lawyer note, or lawyer approval.
5. If a practice category is inferred, mark it as `methodology_inferred` and `needs_lawyer_review`.

Each practice category must record:

```text
practice_category_id
Chinese name
English name
description
source_basis
source_basis_status
lawyer_review_status
benchmark_status
```

Initial review status should be `needs_lawyer_review` unless expressly approved.

---

### Step 2 — Define Performance Nodes

For each practice category, define Level 3 performance nodes.

A performance node must represent a recurring construction contract review issue or mechanism.

Examples:

```text
Site access and possession
Variation instruction
Programme submission
Interim payment certification
Unforeseeable physical conditions
Defects remedy
Notice of claim
Engineer determination
```

Rules:

1. A performance node must not be a random FIDIC heading.
2. A performance node must be useful for reviewing a non-FIDIC contract.
3. A performance node must be capable of producing checklist questions.
4. If the node comes from mindmap, record the mindmap source.
5. If the node is inferred, mark `methodology_inferred`, `needs_lawyer_review`, and `not_benchmark_ready`.

Each performance node must record:

```text
functional_path
node_name
node_description
source_basis
source_basis_status
primary_clause_anchors
secondary_clause_anchors
lawyer_review_status
benchmark_status
```

---

### Step 3 — Map FIDIC Clause Anchors

Map each performance node to concrete FIDIC clauses or sub-clauses.

Rules:

1. Use concrete clause / sub-clause anchors.
2. Do not use clickable range anchors.
3. Split ranges such as `7.1–7.8` into individual anchors: `7.1`, `7.2`, `7.3`, etc.
4. Keep FIDIC clause text as source layer, not classification logic.
5. Do not alter FIDIC wording.
6. If the source text is not loaded or not verified, mark the status clearly.

Each clause anchor must record:

```text
clause_no
clause_title
source_form
primary_path
secondary_paths
mapping_reason
source_text_status
pdf_verification_status
lawyer_review_status
benchmark_status
```

---

### Step 4 — Assign Primary and Secondary Paths

Each clause-element should have one primary path where possible.

Rules:

1. Primary path = where the clause-element is principally reviewed.
2. Secondary path = genuine cross-functional effect.
3. Do not duplicate a clause-element merely because it is generally relevant.
4. If uncertain, mark `needs_lawyer_review`.

Examples:

```text
Variation instruction
Primary: Scope & Interface
Secondary: Time / Payment & Price / Claims & Disputes where relevant

Delayed site access relief
Primary: Scope & Interface
Secondary: Time / Claims & Disputes

Engineer determination
Primary: Contract Mechanics
Secondary: linked category depending on what is being determined
```

Every secondary path must include a cross-link reason.

---

### Step 5 — Extract Clause Elements and Capture Qualifiers / Limitations

Use only the three approved element types:

```text
1. Responsibility / Obligation Allocation
2. Process Control
3. Legal Effect / Outcome Control
```

Do not use the following as standalone element types:

```text
Subject Matter
Timing
Procedure
Evidence / Record
Exception / Carve-out
Consequence
Risk Allocation
```

Rules:

1. Element extraction is not sentence splitting.
2. Each element must represent one core contractual mechanism.
3. Each element must be capable of becoming a checklist question.
4. Each element must be supported by source wording or expressly marked as inferred.
5. Codex must not invent elements.
6. Subject matter is normally captured by the functional path, performance node, and clause heading; it is not an element type.
7. Qualifiers and limitations must be captured inside the relevant element.

#### Qualifier / limitation rule

Qualifier / limitation is not a separate workflow layer, element type, tag, or category. It is an internal field of the relevant element.

Record wording such as:

```text
subject to
unless
except
to the extent
provided that
excluding
notwithstanding
without prejudice
no entitlement to the extent
shall not constitute waiver
```

If no qualifier is identified, write:

```text
None identified
```

This field is important because a contract may appear to grant relief but materially limit or exclude it.

Each element must record:

```text
element_id
element_type
element_name
core_mechanism
source_clause
source_text_basis
source_basis_status
qualifier_limitation
primary_checklist_question
supplementary_checklist_questions
lawyer_review_status
benchmark_status
```

---

### Step 6 — Apply Legal-Effect Tags

Tags are applied to elements, not to whole clauses by default.

Use only the approved tags:

```text
Claim for EOT
Claim for Cost
Contractor Breach / Default
Employer Breach / Default
Determination
Condition Precedent
Time Bar
Deemed Approval
Deemed Rejection
Deduction
Withholding
Set-off
Indemnity
Remedy
Termination Trigger
Back-to-back
Waiver / Non-Waiver / Discharge
Counterclaim / Countercharge
```

Do not use:

```text
Generic Claim
Generic EOT
Generic Breach / Default
```

Rules:

1. Do not tag by legal intuition.
2. Do not tag merely because an issue may arise in practice.
3. Every tag must have a tag reason.
4. Every tag must have source text basis.
5. If wording is unclear, mark `needs_lawyer_review`.
6. Generic Claim may be used only as a UI group label, not as a legal-effect tag.

Each tag entry must record:

```text
tag
tag_reason
source_text_basis
tag_status
lawyer_review_status
```

---

### Step 7 — Convert Each Element Mechanism into Checklist Question

Checklist questions are the bridge from FIDIC baseline to future non-FIDIC contract review.

Core rule:

```text
Each element must represent one core contractual mechanism.
Each element should have one primary checklist question corresponding to that core mechanism.
```

This means the closest one-to-one relationship is:

```text
element core mechanism ↔ primary checklist question
```

Not:

```text
clause ↔ checklist question
tag ↔ checklist question
```

#### Split rule

If one proposed element produces multiple independent checklist questions that may have different answers in a target contract, split the element into separate elements.

Example:

```text
Delayed access gives EOT?
Delayed access gives Cost?
```

These may have different answers in a target contract, so they should usually be separate elements:

```text
Delayed access time relief
Delayed access cost relief
```

#### Qualifier checklist rule

Qualifiers and limitations may generate supplementary checklist questions where they materially affect entitlement, risk, or comparison value.

Example:

```text
Element:
Delayed access cost relief

Primary checklist question:
Does the contract give the Contractor a claim for Cost / Cost Plus Profit where the Employer delays access or possession?

Qualifier / limitation:
No entitlement to the extent caused by Contractor error or delay.

Supplementary checklist question:
Is cost relief excluded to the extent the delay is caused by the Contractor?
```

Each checklist item should allow future reviewers to mark:

```text
present
missing
unclear
weaker_than_fidic_baseline
stronger_than_fidic_baseline
risk_shifted_to_contractor
risk_shifted_to_employer
needs_lawyer_review
```

---

### Step 8 — Assign Source, Review, and Benchmark Status

Every item must carry status.

#### Source basis status

```text
mindmap_supported
fidic_text_supported
user_confirmed
lawyer_note_supported
methodology_inferred
unsupported
```

Multiple statuses may apply.

#### Lawyer review status

```text
needs_lawyer_review
lawyer_approved
revised
deferred
rejected
```

#### Benchmark status

```text
not_benchmark_ready
candidate_benchmark
benchmark_ready
remove_from_benchmark
```

Critical rule:

```text
Only lawyer_approved items can become benchmark_ready.
Codex must never mark benchmark_ready.
ChatGPT must not mark benchmark_ready unless expressly instructed by the user.
```

---

### Step 9 — Create Category Execution File

Each main category must have its own execution file.

Suggested files:

```text
project-control/category-execution/10_SCOPE_AND_INTERFACE_EXECUTION_MATRIX.md
project-control/category-execution/11_TIME_EXECUTION_MATRIX.md
project-control/category-execution/12_PAYMENT_AND_PRICE_EXECUTION_MATRIX.md
project-control/category-execution/13_RISK_ALLOCATION_EXECUTION_MATRIX.md
project-control/category-execution/14_LIABILITY_AND_REMEDIES_EXECUTION_MATRIX.md
project-control/category-execution/15_CLAIMS_AND_DISPUTES_EXECUTION_MATRIX.md
project-control/category-execution/16_CONTRACT_MECHANICS_EXECUTION_MATRIX.md
```

Each execution file must include:

1. Purpose;
2. Source register;
3. Practice category structure;
4. Execution matrix;
5. Clause anchor index;
6. Element index;
7. Tag index;
8. Cross-link register;
9. Checklist register;
10. Lawyer review register;
11. Benchmark register;
12. Change log.

---

### Step 10 — QA Gates Before UI/Data Implementation

No category execution matrix may be used to drive UI/data implementation until it has passed the QA gates below.

#### Gate 1 — Source Gate

1. Every practice category and node has source basis.
2. Every clause anchor exists in the FIDIC source layer.
3. No clickable range clause remains.
4. Any inferred item is clearly marked.

#### Gate 2 — Element Gate

1. Every element uses one of the three approved element types.
2. Every element has one core mechanism.
3. Every element has source text basis or is clearly marked `methodology_inferred`.
4. Every element has one primary checklist question.
5. Any supplementary checklist question is tied to qualifier, limitation, evidence, or comparison use.

#### Gate 3 — Tag Gate

1. Every tag is from the approved tag dictionary.
2. Every tag has express source wording.
3. No deprecated generic Claim / EOT / Breach Default tag is used.
4. Every tag has a tag reason.

#### Gate 4 — Mapping Gate

1. Each clause-element has one primary path where possible.
2. Secondary path is used only for genuine cross-category effect.
3. Cross-link reason is recorded.

#### Gate 5 — Review Gate

1. All items are marked with lawyer review status.
2. No item is `benchmark_ready` unless `lawyer_approved`.
3. Change log is updated.

---

## 6. Mandatory Execution Matrix Format

Use this format for each performance node.

```markdown
### Node: [Performance Node Name]

Functional path:
[Main Category] > [Practice Category] > [Performance Node]

Source basis:
- Mindmap: [node / note / not available]
- FIDIC clause source: [clause numbers]
- Methodology basis: [approved methodology reference]
- User approval: [yes / no / pending]

Primary clause anchors:
- [clause no] [clause title]

Secondary / cross-link clauses:
- [clause no] [clause title] — [reason]

Element extraction:

| Element ID | Element type | Element name | Core mechanism | Source text basis | Tags | Tag reason | Qualifier / limitation | Primary checklist question | Supplementary checklist questions | Status | Benchmark status |
|---|---|---|---|---|---|---|---|---|---|---|---|

Lawyer review note:
- [needs_lawyer_review / lawyer_approved / revised / deferred / rejected]

Change log:
- [date] [change] [reason] [reviewer]
```

---

## 7. No-Invention Rules for ChatGPT and Codex

### ChatGPT may:

1. propose structure;
2. draft execution matrix;
3. identify possible source links;
4. flag gaps;
5. propose checklist questions;
6. mark inferred items as `needs_lawyer_review`.

### ChatGPT must not:

1. treat inferred nodes as approved;
2. treat inferred elements as benchmark;
3. invent tag support;
4. silently fill source gaps;
5. upgrade items to `benchmark_ready` without express user instruction.

### Codex may:

1. create files;
2. populate tables from approved source files;
3. validate JSON / MD consistency;
4. split clause ranges;
5. update UI to reflect approved execution matrix;
6. create audit reports.

### Codex must not:

1. create legal analysis;
2. invent practice categories;
3. invent performance nodes;
4. invent clause-element mappings;
5. invent legal-effect tags;
6. change FIDIC source text;
7. mark `lawyer_approved`;
8. mark `benchmark_ready`;
9. modify files outside the authorised project root.

---

## 8. Category Execution File Status Rules

Execution files should include a status block at the top.

Suggested status block:

```text
Execution file status:
draft_execution_matrix

Source status:
partially_source_supported

Lawyer review status:
needs_lawyer_review

Benchmark status:
not_benchmark_ready
```

Available execution file statuses:

```text
draft_execution_matrix
source_checked
lawyer_review_in_progress
lawyer_approved_execution_matrix
ui_ready
superseded
```

Only `lawyer_approved_execution_matrix` should be used to populate benchmark-ready UI/data.

---

## 9. Change Control / 修改控制

Every execution file must include a change log.

Minimum fields:

```text
date
version
changed_by
change_summary
reason
affected_nodes
affected_clauses
review_status
```

No silent changes are allowed.

When a node, element, tag, or checklist question is modified, the change log must explain why.

---

## 10. Practical Execution Sequence

For every main category, follow this sequence:

```text
Source collection
→ practice category definition
→ performance node definition
→ FIDIC clause anchor mapping
→ primary / secondary mapping
→ element extraction with qualifier capture
→ legal-effect tagging
→ checklist conversion
→ source / review / benchmark status assignment
→ execution file creation
→ QA gates
→ UI/data implementation
```

Do not move to UI/data implementation before the execution file passes QA gates.

---

## 11. Project-Control Integration

This protocol should be saved as:

```text
project-control/03_CATEGORY_EXECUTION_PROTOCOL.md
```

`project-control/00_PROJECT_RULES.md` should include:

```text
For any category execution matrix, Codex must follow project-control/03_CATEGORY_EXECUTION_PROTOCOL.md and must not create, approve, or benchmark legal content without express lawyer/user approval.
```
