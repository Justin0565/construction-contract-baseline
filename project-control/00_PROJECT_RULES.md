# 00_PROJECT_RULES

## Construction Contract Intelligence Dashboard – Project Control Rules

This file records the mandatory project control rules for the FIDIC 2017 Red construction contract dashboard.

The purpose is to prevent the project from drifting back into a simple FIDIC clause directory. The dashboard must be built around practical construction performance categories, with FIDIC clauses used as source material and verification references.

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
Level 1: Main Contract System
Level 2: Practice Category
Level 3: Performance Node
Level 4: FIDIC Clause / Sub-Clause

Source Layer: FIDIC Clause Library
Below Clause Level: Clause Elements / Legal Effect Tags / Full Clause Text / Verification Status
Mapping Layer: Performance Node ↔ FIDIC Clause; Clause Element ↔ Source Clause
Tag Layer: Legal Effect Tags
```

Do not use the field name `logic_group`.

Use:

```text
practice_category
```

Reason: the second layer is not an abstract logic group. It is a practical classification based on how construction contracts operate in real projects.

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

---

## 4. Scope & Works Model Rule

The first completed model main category is:

```text
Scope & Works / 工程范围与工作内容
```

Scope & Works must be treated broadly. It does not only mean narrow work scope. It covers the practical performance system required to define, enable, manage, execute and change the Works.

The approved second-layer practice categories for Scope & Works are:

```text
1. Main Performance Obligations / 主要义务
2. Ancillary Management Obligations / 附带义务，即管理
3. Employer Enabling Obligations / 业主 / 对方使能义务
4. Scope Variables and Variations / 变量，即变更
```

---

## 5. Scope & Works Practice Categories

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

They are not a standalone main system and should not be primarily classified under Claims, Risk or Time. Their consequences may cross-link to Time, Payment, Claims or Indemnity, but their primary home is Scope & Works > Ancillary Management Obligations.

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
Level 1: Scope & Works
Level 2: Ancillary Management Obligations
Level 3: Permits and approvals / 证照
Level 4: FIDIC Clause / Sub-Clause anchors: C1.13, C2.2, C8.5, C20.2
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

For all legal-effect tagging, Codex must follow:

```text
project-control/08_TAG_DICTIONARY_AND_TAGGING_RULES.md
```

Codex must not create, infer, rename, merge, broaden, or apply tags outside the approved tag dictionary unless expressly instructed.

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
- Main Contract System
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

---

## 10. Mandatory Finalisation Rule

For each Main Contract System, once the dashboard content has gone through review rounds and is approved, two control outputs must be produced before moving to the next system:

```text
1. [System]_Final_Dashboard_Content_Matrix
2. Dashboard_Classification_Methodology_Memo
```

For the current pilot system, the two required files are:

```text
1. Scope_Final_Dashboard_Content_Matrix
2. Dashboard_Classification_Methodology_Memo
```

No new Main Contract System should be coded or populated until these two files are produced or updated for the approved system.

---

## 11. Replication Rule

After Scope & Works is finalised, the same methodology should be replicated to other systems.

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

Do not blindly copy the Scope practice categories into other systems.

Each system needs its own practice categories based on construction contract practice.

Expected future systems include:

```text
- Time & Completion
- Price & Payment
- Risk Allocation
- Claims & Dispute Procedure
- Suspension & Termination
- Testing, Taking Over & Defects
- Contract Administration
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
10. Do not move to a new main system until the approved system has its final matrix and methodology memo.
11. Every clickable clause anchor must identify exactly one concrete clause or sub-clause; never render a range or combined reference as one anchor.
12. Use only the three Clause Element Extraction Methodology v1.2 core element types.
13. Convert every completed element into at least one usable checklist question.
```

---

## 13. Project-Wide Clause Anchor Normalisation Rule

This rule applies to every Main Contract System, every practice category, every performance node, the Clause Spine, the Tag View, and all future dashboard modules.

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

This normalisation rule is a project-level data-boundary requirement, not a Scope & Works-only display treatment.

---

## 14. Project-Control Methodology Precedence

Codex must follow the project-control methodology files before changing data or UI.

For clause classification, Codex must follow:

```text
project-control/01_Dashboard_Classification_Methodology_Memo.md
```

For Scope-based dashboard methodology, Codex must follow:

```text
project-control/09_SCOPE_BASED_DASHBOARD_STANDARD.md
```

For element extraction, Codex must follow:

```text
project-control/07_ELEMENT_METHODOLOGY_MANUAL.md
```

For legal-effect tagging, Codex must follow:

```text
project-control/08_TAG_DICTIONARY_AND_TAGGING_RULES.md
```

Codex must not create legal analysis, tags, mappings or clause interpretations outside the approved methodology unless expressly instructed.
