# 00_PROJECT_RULES

## Construction Contract Intelligence Dashboard – Project Control Rules

This file records the mandatory project control rules for the FIDIC 2017 Red construction contract dashboard.

The purpose is to prevent the project from drifting back into a simple FIDIC clause directory. The dashboard must be built around practical construction performance categories, with FIDIC clauses used as source material and verification references.

---

## 0. Version and Change Control

```text
Version: v2.0
Date: 2026-08-18
Supersedes: v1.x (eight Main Contract System model)
```

Change log:

| Date | Version | Changed by | Change summary | Reason | Affected sections |
|---|---|---|---|---|---|
| 2026-08-18 | v2.0 | Lawyer (instruction); Implementation Agent (execution) | Main Category identifiers in `data/modules.json` migrated to the section 2A canonical ids: `scope` to `scope_and_works`, `payment` to `payment_and_price`, `risk` to `risk_allocation`, `liability` to `liability_and_remedies`, `claims` to `claims_and_disputes`, `mechanics` to `contract_mechanics`; `time` unchanged. The `moduleId` foreign keys in `data/sub_issues.json` migrated to match. Stored `Scope & Works` data values and the `contractSystems` ids in `app.js` were not changed. | Section 2B rule 5 migration record. Express lawyer instruction to adopt one identifier convention and apply it consistently. | 2A, 2B (rule text unchanged; data files only) |
| 2026-08-18 | v2.0 | Lawyer (approved) | Adopted the seven approved Main Categories. `Scope & Works` renamed `Scope & Interface / 工程范围与界面`. Eight-system replication list withdrawn. Legacy identifier rule added. `03` and `05` added to methodology precedence. | Top-level taxonomy aligned with the approved product functional model; `03_CATEGORY_EXECUTION_PROTOCOL.md` brought into force. | 2, 2A, 2B, 4, 5, 10, 11, 12, 14 |

No silent changes are allowed. Any amendment to this file must add a row above.

---

## 1. Core Principle

This system is not a FIDIC clause index.

It is an AI-assisted construction contract intelligence system that classifies FIDIC 2017 Red clauses by practical construction performance function.

FIDIC clauses are treated as the source layer and verification layer.

The classification layer must be based on construction contract practice and project performance logic.

---

## 2. Mandatory Hierarchy

The dashboard must use the following hierarchy:

```text
Level 1: Main Category / 主类别
Level 2: Practice Category / 实务分类
Level 3: Performance Node / 履约节点
Level 4: FIDIC Clause / Sub-Clause

Source Layer: FIDIC Clause Library
Below Clause Level: Clause Elements / Legal Effect Tags / Full Clause Text / Verification Status
Mapping Layer: Performance Node ↔ FIDIC Clause; Clause Element ↔ Source Clause
Tag Layer: Legal Effect Tags
```

`Main Category / 主类别` is the governing term for Level 1. The earlier term `Main Contract System` is withdrawn from documentation. The stored field name `main_system` is retained in existing data for backward compatibility; see section 2B.

Do not use the field name `logic_group`.

Use:

```text
practice_category
```

Reason: the second layer is not an abstract logic group. It is a practical classification based on how construction contracts operate in real projects.

---

## 2A. Approved Main Categories / 已批准主类别

All classification and execution work must use the following seven approved Main Categories. These are the canonical labels for display, documentation and data.

| No. | Chinese | English | Canonical id |
|---:|---|---|---|
| 1 | 工程范围与界面 | Scope & Interface | `scope_and_works` (legacy id, retained) |
| 2 | 时间 | Time | `time` |
| 3 | 付款与对价 | Payment & Price | `payment_and_price` |
| 4 | 风险分配 | Risk Allocation | `risk_allocation` |
| 5 | 责任与救济 | Liability & Remedies | `liability_and_remedies` |
| 6 | 索赔与争议 | Claims & Disputes | `claims_and_disputes` |
| 7 | 合同螺丝钉 | Contract Mechanics | `contract_mechanics` |

Do not substitute different top-level labels unless expressly approved by the lawyer.

The following are withdrawn as standalone Level 1 labels:

```text
Scope & Works
Time & Completion
Price & Payment
Suspension & Termination
Testing / Taking Over / Defects
Contract Administration
Default / Termination
Risk & Protection
Default, Remedies & Termination
Claims, Determination & Disputes
```

These concepts may still appear as practice categories, performance nodes, cross-links or issue labels under the approved seven Main Categories where appropriate.

`data/modules.json` is the single source of truth for Main Category labels and ids. Any other hard-coded top-level list in code must be removed and replaced by a read from `data/modules.json`.

---

## 2B. Legacy Identifier and Display-Name Rule

Existing data stores the string `Scope & Works` as a value in `main_system`, `primary_path`, `secondary_paths` and `group_path` fields across approved Scope mapping data. That string is a stored data value, not a display label.

Rules:

1. Do not bulk-rename stored values. Existing `scope_and_works` ids and `Scope & Works` stored values are retained.
2. All user-facing display of a Main Category must pass through a single display-name mapping layer.
3. The mapping layer resolves stored values and ids to the canonical labels in section 2A.
4. New data must use canonical labels. The legacy value is tolerated only where it already exists.
5. Migration of legacy stored values to canonical values requires a separate express instruction and its own change-log entry.

The mapping layer must be implemented once and used by every view. Duplicated or inline label translation in individual components is not permitted.

---

## 3. Source Layer Rule

Every FIDIC clause used by the system must be linked to the FIDIC clause library.

Each source clause should include:

```json
{
  "id": "fidic_2017_red_1_13",
  "source_form": "FIDIC 2017 Red",
  "clause_no": "1.13",
  "clause_title": "Compliance with Laws",
  "full_clause_text": "...",
  "internal_cross_references": ["2.2", "8.5", "20.2"],
  "verification_status": "source_text_loaded"
}
```

Full clause text should be stored once only in the FIDIC clause library.

Do not duplicate full clause text in performance nodes or clause elements.

Performance nodes and clause elements should link to the source clause by `source_clause_refs`.

FIDIC source text is used for internal, personal, non-commercial research. It must not be reproduced from memory by any agent. Only text extracted from the licensed source document may be stored. Any clause whose text has not been extracted must carry an explicit not-loaded status and must not be presented as verified.

---

## 4. Scope & Interface Model Rule

The first completed model Main Category is:

```text
Scope & Interface / 工程范围与界面
```

Scope & Interface must be treated broadly. It does not only mean narrow work scope. It covers the practical performance system required to define, enable, manage, execute and change the Works, together with the interfaces between the parties and between the Works and third parties.

The approved second-layer practice categories for Scope & Interface are:

```text
1. Main Performance Obligations / 主要义务
2. Ancillary Management Obligations / 附带义务，即管理
3. Employer Enabling Obligations / 业主 / 对方使能义务
4. Scope Variables and Variations / 变量，即变更
```

---

## 5. Scope & Interface Practice Categories

### 5.1 Main Performance Obligations / 主要义务

This category covers what the Contractor must ultimately deliver, execute, procure or design.

Performance nodes:

```text
- Employer design basis / E设计
- Procurement / P采购
- Execution of Works / C施工
```

### 5.2 Ancillary Management Obligations / 附带义务，即管理

This category covers the resources, processes and management obligations required for the Contractor to perform the Works.

Performance nodes:

```text
- Personnel / 人员
- Documents / 文件
- Goods / 货物
- Site, including QHSE / 现场，包括 QHSE
- Permits and approvals / 证照
- Subcontracting / 分包
```

Important rule:

```text
Permits and approvals / 证照 belong under Ancillary Management Obligations.
```

They are not a standalone Main Category and should not be primarily classified under Claims, Risk or Time. Their consequences may cross-link to Time, Payment & Price, Claims & Disputes or Indemnity, but their primary home is Scope & Interface > Ancillary Management Obligations.

### 5.3 Employer Enabling Obligations / 业主 / 对方使能义务

This category covers the conditions and inputs the Employer must provide so that the Contractor can perform.

Performance nodes:

```text
- Site access and possession / 提供场地
- Employer-supplied materials and equipment / 提供设备或材料
- Engineer appointment and role / 聘用监理
- Employer’s personnel and other contractors / 管理本方人员及其他承包商
- Employer permits / 提供证照
- Employer assistance / 提供协助
- Site data and reference items / 提供现场数据
- Employer design documents / 提供设计 / Specifications / Drawings
- Employer financial arrangements / 提供资金安排
```

Boundary rules for these nodes:

```text
Engineer appointment and role / 聘用监理
  Primary: Scope & Interface > Employer Enabling Obligations
  The Engineer's determination mechanism itself is primary to Contract Mechanics.

Employer financial arrangements / 提供资金安排
  Primary: Scope & Interface > Employer Enabling Obligations
  Payment consequences cross-link to Payment & Price.
```

### 5.4 Scope Variables and Variations / 变量，即变更

This category covers how the original scope changes, and how changes are instructed, proposed, valued and reflected in time and price.

Performance nodes:

```text
- Variation scope / 范围
- Variation recognition dispute / VO认定争议
- Variation instruction / Instruction
- Variation proposal / Proposal
- Variation EOT and Cost / EOT + Cost
- Refusal to execute variation / 拒绝履行
- Daywork / Daywork
- Provisional Sum / Provisional Sum
- Change in Laws / Change in Laws
```

---

## 6. Clause Element Rule

### Clause Element Extraction Methodology v1.2

The governing extraction methodology is `07_ELEMENT_METHODOLOGY_MANUAL.md`. All element extraction, comparison, tagging and checklist conversion must comply with v1.2.

The only approved core element types are:

```text
1. Responsibility / Obligation Allocation / 责任 / 义务配置
2. Process Control / 过程控制
3. Legal Effect / Outcome Control / 法律效果 / 结果控制
```

An element is the smallest functional contract mechanism inside a clause that can be reviewed, compared, tagged, or converted into a checklist question. Do not treat every sentence, defined term or exception as an element.

The former standalone types `Subject Matter / Scope`, `Timing`, `Procedure`, `Consequence`, `Evidence / Record`, `Exception / Carve-out` and general `Risk Allocation` are deprecated and must not be used as a separate element taxonomy. In particular:

```text
- subject matter is classification or search metadata, not an element type;
- timing, procedure, evidence and records belong within Process Control where relevant;
- consequence is expressed as Legal Effect / Outcome Control;
- qualifications, limitations, exclusions, carve-outs and risk-allocation wording are normally qualifiers or limitations to the relevant element;
- a separate risk-allocation mechanism is used only where the clause is principally a risk-allocation mechanism.
```

Every element must be capable of conversion into at least one checklist question. Tags apply to elements, not to an entire clause by default.

Level 3 is the performance node.

FIDIC clause numbers are not Level 3.

Clause numbers are source references.

Correct structure:

```text
Level 1: Scope & Interface / 工程范围与界面
Level 2: Ancillary Management Obligations
Level 3: Permits and approvals / 证照
Level 4: FIDIC Clause / Sub-Clause anchors: 1.13, 2.2, 8.5, 20.2
Below clause level: Clause Elements, Legal Effect Tags, Full Clause Text and Verification Status
```

Example elements under `Permits and approvals / 证照`:

```text
- Employer permits
- Contractor permits
- Contractor assistance for Employer permits
- Contractor compliance with Employer permits
- Employer delay or failure consequence
- Contractor failure consequence
- Indemnity for permit failures
- EOT and Cost Plus Profit for Employer permit delay
```

---

## 7. Legal Effect Tags

Tags are legal-effect annotations.

Tags are not classification categories.

Tags must be applied at clause element level.

The approved tag list is:

```text
1. Claim for EOT
2. Claim for Cost
3. Contractor Breach / Default
4. Employer Breach / Default
5. Determination
6. Condition Precedent
7. Time Bar
8. Deemed Approval
9. Deemed Rejection
10. Deduction
11. Withholding
12. Set-off
13. Indemnity
14. Remedy
15. Termination Trigger
16. Back-to-back
17. Waiver / Non-Waiver / Discharge
18. Counterclaim / Countercharge
```

---

## 8. Tagging Rules

### Tagging Control

For all legal-effect tagging, the Implementation Agent must follow:

```text
project-control/08_TAG_DICTIONARY_AND_TAGGING_RULES.md
```

The Implementation Agent must not create, infer, rename, merge, broaden, or apply tags outside the approved tag dictionary unless expressly instructed.

Tags are applied to clause elements, not to whole clauses by default.

Do not tag by legal intuition or merely because an issue may arise in practice. Only tag where express clause wording satisfies the complete definition and QC rules in the governing tag manual.

Do not use generic `EOT` as a tag. Do not use generic `Claim` as a standalone legal-effect tag unless expressly approved. Use `Claim for EOT` and `Claim for Cost` as defined in the tag manual.

---

## 9. Dashboard Display Rule

The dashboard must allow the user to move in both directions:

```text
Classification → Clause
Tag → Clause
Clause → Classification
```

Each clause element view should show:

```text
- Main Category
- Practice Category
- Performance Node
- Clause Element
- FIDIC clause references
- Clause number
- Clause title
- Full clause text
- Legal effect tags
- Tag reasons
- Verification status
```

Clicking a legal-effect tag must show:

```text
- tag name
- all related clause numbers
- clause titles
- group paths
- performance nodes
- clause elements
- tag reasons
- full clause text viewer
```

Main Category labels displayed in any view must be resolved through the display-name mapping layer in section 2B.

---

## 10. Mandatory Finalisation Rule

Two families of control output exist. They are complementary and neither replaces the other.

### 10.1 Structural control matrix

For each Main Category, a structural control matrix records the approved practice categories, performance nodes and matrix template:

```text
project-control/02_Scope_Final_Dashboard_Content_Matrix.md
```

Together with the classification methodology memo:

```text
project-control/01_Dashboard_Classification_Methodology_Memo.md
```

### 10.2 Category execution matrix

For each Main Category, the populated execution content is recorded in a category execution matrix governed by `03_CATEGORY_EXECUTION_PROTOCOL.md`:

```text
project-control/category-execution/10_SCOPE_AND_INTERFACE_EXECUTION_MATRIX.md
project-control/category-execution/11_TIME_EXECUTION_MATRIX.md
project-control/category-execution/12_PAYMENT_AND_PRICE_EXECUTION_MATRIX.md
project-control/category-execution/13_RISK_ALLOCATION_EXECUTION_MATRIX.md
project-control/category-execution/14_LIABILITY_AND_REMEDIES_EXECUTION_MATRIX.md
project-control/category-execution/15_CLAIMS_AND_DISPUTES_EXECUTION_MATRIX.md
project-control/category-execution/16_CONTRACT_MECHANICS_EXECUTION_MATRIX.md
```

Division of function:

```text
02 defines the approved structure and the matrix template.
10–16 record the actual executed content, in the format required by 03 section 6.
Where the two differ in column set, 03 section 6 governs the execution matrix.
```

No new Main Category should be coded or populated until the current Main Category has both its structural control matrix and its category execution matrix, and the execution matrix has passed the QA gates in `03` section 10.

---

## 11. Replication Rule

After Scope & Interface is finalised, the same methodology is replicated to the remaining six approved Main Categories.

Replicate:

```text
- hierarchy
- source-layer treatment
- mapping-layer rule
- tag rule
- full clause viewer
- tag-to-clause search
- group path display
- verification status
```

Do not blindly copy the Scope & Interface practice categories into other Main Categories.

Each Main Category needs its own practice categories based on construction contract practice.

The remaining Main Categories are:

```text
- 时间 / Time
- 付款与对价 / Payment & Price
- 风险分配 / Risk Allocation
- 责任与救济 / Liability & Remedies
- 索赔与争议 / Claims & Disputes
- 合同螺丝钉 / Contract Mechanics
```

---

## 12. Non-Negotiable Rules

```text
1. Do not classify by simply copying FIDIC clause headings.
2. Do not treat FIDIC clause numbers as the classification layer.
3. Do not use logic_group.
4. Use practice_category.
5. Keep full FIDIC clause text in the source layer.
6. Apply tags only at clause element level.
7. Apply tags only where express clause text supports them.
8. Keep Deduction, Withholding and Set-off separate.
9. Do not use generic EOT or generic Claim as standalone approved tags; use Claim for EOT and Claim for Cost.
10. Do not move to a new Main Category until the current one has its structural matrix, its execution matrix, and a QA-gate pass.
11. Every clickable clause anchor must identify exactly one concrete clause or sub-clause; never render a range or combined reference as one anchor.
12. Use only the three Clause Element Extraction Methodology v1.2 core element types.
13. Convert every completed element into at least one usable checklist question.
14. Use only the seven approved Main Categories in section 2A.
15. Resolve all Main Category display labels through the single mapping layer in section 2B; do not bulk-rename stored identifiers or stored values.
16. Never reproduce FIDIC source text from memory; use extracted text only.
17. No agent may write lawyer_approved or benchmark_ready. Only the lawyer sets these.
```

---

## 13. Project-Wide Clause Anchor Normalisation Rule

This rule applies to every Main Category, every practice category, every performance node, the Clause Spine, the Tag View, and all future dashboard modules.

Each clickable clause chip, button, link or source anchor must resolve to exactly one concrete FIDIC clause or sub-clause number.

Correct:

```text
3.1  3.2  3.3  3.4  3.5  3.6  3.7  3.8
```

Incorrect as a clickable anchor:

```text
3.1–3.8
3.1 / 3.2
```

Combined references and ranges may remain in narrative summaries, legal analysis and source quotations where they accurately describe a group of provisions. They must not be used as clickable anchor values.

Before rendering or building mappings, every anchor-bearing dataset must:

```text
1. split slash-separated combined references;
2. expand same-parent sequential ranges into individual clause numbers;
3. reject any value that is not one concrete numeric clause number;
4. de-duplicate the resulting individual anchors; and
5. preserve the mapping from each individual anchor to its source record.
```

This normalisation rule is a project-level data-boundary requirement, not a Scope-only display treatment.

---

## 14. Project-Control Methodology Precedence

The Implementation Agent must follow the project-control methodology files before changing data or UI.

For the division of work between the lawyer, the advisory agent and the Implementation Agent:

```text
project-control/05_AI_ROLE_DIVISION_PROTOCOL.md
```

For any category execution matrix:

```text
project-control/03_CATEGORY_EXECUTION_PROTOCOL.md
```

The Implementation Agent must follow `03_CATEGORY_EXECUTION_PROTOCOL.md` and must not create, approve, or benchmark legal content without express lawyer approval.

For clause classification:

```text
project-control/01_Dashboard_Classification_Methodology_Memo.md
```

For the approved Scope & Interface structure:

```text
project-control/02_Scope_Final_Dashboard_Content_Matrix.md
```

For element extraction:

```text
project-control/07_ELEMENT_METHODOLOGY_MANUAL.md
```

For legal-effect tagging:

```text
project-control/08_TAG_DICTIONARY_AND_TAGGING_RULES.md
```

For Scope-based dashboard methodology:

```text
project-control/09_SCOPE_BASED_DASHBOARD_STANDARD.md
```

Where two project-control files conflict, precedence is:

```text
00 > 05 > 03 > 01 > 07 > 08 > 09 > 02
```

A conflict must be reported to the lawyer, not resolved by the Implementation Agent.

No agent may create legal analysis, tags, mappings or clause interpretations outside the approved methodology unless expressly instructed.

---

## 15. Areas Not Yet Governed

The following are within the product scope but are not yet governed by any project-control file. No benchmark-grade content may be produced in these areas until a governing protocol exists:

```text
- risk scoring (element / sub-topic / topic / overall)
- non-FIDIC clause variants and their licensing position
- the drafting engine and generated contracts
```

Reserved file numbers:

```text
04_RISK_SCORING_PROTOCOL.md
06_VARIANTS_AND_DRAFTING_PROTOCOL.md
```
