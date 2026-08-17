# Scope-Based Dashboard Standard v1.0

## 1. Purpose

Scope & Works is the first model main category completed in the dashboard. It is used as the template for later categories including Time & Completion, Price & Payment, Risk Allocation, Claims & Dispute Procedure, Suspension & Termination, Testing, Taking Over & Defects, and Contract Administration.

The purpose of this file is to preserve the Scope methodology so that later modules follow the same classification, element extraction, tagging, mapping and UI logic.

This standard is used together with `project-control/01_Dashboard_Classification_Methodology_Memo.md`, `project-control/07_ELEMENT_METHODOLOGY_MANUAL.md` and `project-control/08_TAG_DICTIONARY_AND_TAGGING_RULES.md`.

## 2. Governing Hierarchy

The dashboard uses the following hierarchy:

Level 1:
Main Contract System

Level 2:
Practice Category

Level 3:
Performance Node

Level 4:
FIDIC Clause / Sub-Clause

Below clause level:

- Clause Elements
- Legal Effect Tags
- Full Clause Text
- Source / verification status
- Lawyer review status

Do not use FIDIC clause headings as the functional dashboard structure.

The correct direction is:

```text
Construction contract practice logic
→ performance nodes
→ FIDIC clause anchors
→ clause elements
→ legal-effect tags
→ full clause text verification
```

FIDIC is the clause source and baseline, not the dashboard logic itself.

## 3. Scope & Works Practice Categories

Scope & Works uses four practice categories:

1. Main Performance Obligations / 主要义务
2. Ancillary Management Obligations / 附带义务，即管理
3. Employer Enabling Obligations / 业主 / 对方使能义务
4. Scope Variables and Variations / 变量，即变更

These categories are practice-based, not copied from the FIDIC table of contents.

## 4. Performance Node Rule

Each practice category contains performance nodes.

Each performance node should identify:

- the functional path;
- primary FIDIC clause anchors;
- secondary / cross-link clauses where relevant;
- clause elements;
- legal-effect tags;
- tag reasons;
- source text status;
- PDF verification status;
- lawyer review status.

A performance node should represent a real construction contract review issue, not merely a FIDIC heading.

## 5. Primary / Secondary Mapping Rules

1. Each clause should have one primary functional path where possible.
2. A clause may have secondary paths only where the same clause performs a genuine cross-functional role.
3. Do not duplicate a clause across multiple paths merely because the clause is generally relevant.
4. Variation belongs primarily under Scope & Works where the issue is change to the Works / scope.
5. Time consequences of Variation may cross-link to Time & Completion.
6. Price consequences of Variation may cross-link to Price & Payment.
7. Claim procedure consequences may cross-link to Claims & Dispute Procedure.
8. Clause ranges must be split into individual clause chips in implementation.
9. Range labels may appear in narrative summaries, but not as clickable clause anchors.
10. Top-level clause references may be retained only where the intended reference is genuinely to the whole top-level clause.

## 6. Clause Anchor Rule

Clickable clause anchors must refer to concrete FIDIC clauses or sub-clauses.

Examples:

Do not use clickable range chips such as:

- 7.1–7.8
- 6.1–6.12
- 3.1–3.8

Instead, split them into individual anchors:

- 7.1
- 7.2
- 7.3
- 7.4
- 7.5
- 7.6
- 7.7
- 7.8

The same rule applies to other clause ranges.

## 7. Element Methodology

Scope uses the approved three-type element methodology.

Approved element types:

1. Responsibility / Obligation Allocation
2. Process Control
3. Legal Effect / Outcome Control

Do not use the deprecated standalone element types:

- Subject Matter
- Timing
- Procedure
- Evidence / Record
- Exception / Carve-out
- Consequence
- Risk Allocation

Timing, procedure, evidence and records belong under Process Control where relevant.

Consequence should be expressed as Legal Effect / Outcome Control.

Exceptions, carve-outs, exclusions, conditions and risk allocation wording should generally be recorded as qualifiers / limitations to the relevant element, unless the clause is principally a risk allocation mechanism.

Tags are applied to elements, not to whole clauses by default.

## 8. Tagging Rule

Scope must use the approved tag dictionary in:

```text
project-control/08_TAG_DICTIONARY_AND_TAGGING_RULES.md
```

Approved tags include:

- Claim for EOT
- Claim for Cost
- Contractor Breach / Default
- Employer Breach / Default
- Determination
- Condition Precedent
- Time Bar
- Deemed Approval
- Deemed Rejection
- Deduction
- Withholding
- Set-off
- Indemnity
- Remedy
- Termination Trigger
- Back-to-back
- Waiver / Non-Waiver / Discharge
- Counterclaim / Countercharge

Do not use deprecated standalone tags:

- Claim
- EOT
- Breach / Default

Generic Claim may be used only as a UI group label, not as a legal-effect tag.

## 9. Cross-View Consistency

The three dashboard views must be mutually consistent:

1. Functional Skeleton
2. Clause Spine
3. Tag View

For Scope-related clauses:

- Functional Skeleton clause chips should point to the same clause records used by Clause Spine.
- Tag View should list clauses based on approved tags.
- Clicking a Scope clause chip should open the corresponding Clause Spine clause.
- Clicking a tagged clause should show the same clause / element / tag reason as the Scope view.
- If full source text is not loaded or not verified, the UI should display the relevant source / verification status.

## 10. Source and Review Status

Every mapped Scope clause should carry status metadata where available:

- source_text_loaded
- source_text_not_loaded
- needs_pdf_verification
- pdf_verified
- needs_lawyer_review

Do not silently display blank clause text.

Do not alter FIDIC source wording during UI or data alignment tasks.

## 11. Replication Rule for Later Modules

Later main categories must follow the Scope model:

Practice logic first.

FIDIC clause anchors second.

Elements below clauses.

Tags applied to elements.

Clause text remains source layer.

PDF verification remains separate.

Lawyer review status is preserved.

Later modules must not revert to a FIDIC-heading-based structure.
