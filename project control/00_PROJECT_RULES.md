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
Level 4: Clause Element

Source Layer: FIDIC Clause Library
Mapping Layer: Node / Element ↔ FIDIC Clause
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

## 4. Scope & Works Pilot Rule

The first system to be finalised is:

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

Level 3 is the performance node.

FIDIC clause numbers are not Level 3.

Clause numbers are source references.

Correct structure:

```text
Level 1: Scope & Works
Level 2: Ancillary Management Obligations
Level 3: Permits and approvals / 证照
Level 4: Clause Elements
Source clauses: FIDIC 2017 Red C1.13, C2.2, C8.5, C20.2
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
1. condition_precedent
2. time_bar
3. claim
4. eot
5. counterclaim_countercharge
6. determination
7. breach_default
8. remedy
9. indemnity
10. deduction
11. withholding
12. set_off
13. termination_trigger
14. deemed_approval
15. deemed_rejection
16. back_to_back
17. waiver_discharge
```

---

## 8. Tagging Rules

Do not tag by intuition.

Only tag where the clause text expressly supports the legal effect.

### Claim

Apply only where the clause gives one Party an entitlement to claim payment, EOT, Cost, Cost Plus Profit, damages, reduction or recovery from the other Party, especially where the entitlement is expressly subject to Sub-Clause 20.2 or described as a Claim.

### EOT

Apply only where the clause expressly gives or supports an entitlement to Extension of Time, or expressly identifies a matter as an EOT cause.

### Indemnity

Apply only where the clause expressly uses indemnify, indemnified, indemnity, or hold harmless language.

### Deduction

Apply only where the clause expressly allows a deduction from payment, Contract Price, IPC, FPC or another payment mechanism.

### Withholding

Apply only where the clause expressly allows an amount to be withheld, not certified, or temporarily withheld from payment.

### Set-off

Apply only where the clause expressly uses set-off, off-set, or a clear contractual right of set-off.

Do not treat ordinary deduction or withholding as set-off.

### Determination

Apply where the clause expressly requires the Engineer to proceed under Sub-Clause 3.7 to agree or determine a matter, Claim, amount, EOT, rate, price, reduction or other entitlement.

### Breach / Default

Apply where the clause expressly refers to failure, default, breach, failure to comply, failure to perform, or non-compliance with the Contract, and attaches a legal consequence.

### Deemed Approval

Apply where silence or non-response is expressly deemed consent, approval, no-objection, acceptance or similar positive effect.

### Deemed Rejection

Apply where silence or non-response is expressly deemed rejection, refusal, dispute or similar negative effect.

### Condition Precedent

Apply where compliance with a notice, submission, time limit, consent, approval, guarantee or other step is expressly made a condition to entitlement, payment, access, commencement, certification, taking-over or other legal effect.

### Time Bar

Apply only where failure to comply with a time limit expressly results in loss of entitlement, deemed waiver, deemed acceptance, final and binding effect, or similar preclusion.

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
- Risk & Protection
- Default, Remedies & Termination
- Claims, Determination & Disputes
- Contract Mechanics
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
9. Keep EOT as an independent tag.
10. Do not move to a new main system until the approved system has its final matrix and methodology memo.
```
