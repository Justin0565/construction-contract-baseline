# 01_Dashboard_Classification_Methodology_Memo

## Purpose

This memo records the approved methodology for classifying FIDIC 2017 Red clauses in the Construction Contract Intelligence Dashboard.

Scope & Works is the first completed model category. This memo is the classification source of truth for maintaining Scope and replicating the approved structure across later main contract systems.

---

## Status

```text
Current status: Approved Scope-based classification methodology
Governing standard: Scope-Based Dashboard Standard v1.0
```

---

## 1. Approved Classification Hierarchy

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

---

## 2. Methodology Principles

```text
- Classification is based on construction performance practice.
- FIDIC clauses are source references, not the classification structure.
- Functional direction is practice logic → performance nodes → clause anchors → clause elements → legal-effect tags → source-text verification.
- Each clause should have one primary functional path where possible.
- Secondary paths are used only for genuine cross-functional roles.
- Clickable clause ranges must be split into concrete individual anchors.
- Clause elements are the level at which legal effects are tagged.
- Full clause text is stored in the source layer.
- Each tag must be justified by express clause text.
- Clause elements follow Clause Element Extraction Methodology v1.2.
- Every completed element must be convertible into a checklist question.
```

### Clause Element Extraction Methodology v1.2

The governing manual is `07_ELEMENT_METHODOLOGY_MANUAL.md`.

The approved core element types are:

```text
1. Responsibility / Obligation Allocation / 责任 / 义务配置
2. Process Control / 过程控制
3. Legal Effect / Outcome Control / 法律效果 / 结果控制
```

`Subject Matter / Scope` is not an element type. Timing, procedure, evidence and records are part of Process Control where relevant. Consequence is replaced by Legal Effect / Outcome Control. Exceptions, carve-outs, exclusions, conditions, qualifications and risk-allocation limitations are normally recorded as qualifiers or limitations to the relevant element, unless the clause is principally a risk-allocation mechanism.

Tags attach to elements, not to a whole clause by default, and may be applied only where express source wording satisfies the strict tag rule.

---

## 3. Source Layer Treatment

FIDIC is the clause source and baseline, not the dashboard logic. Full clause text is stored once in the source layer and must not be altered during classification or UI alignment. Source status, PDF verification status and lawyer review status remain distinct.

---

## 4. Mapping Layer Treatment

Each performance node identifies a practice-based functional issue and anchors to specific FIDIC clauses or sub-clauses. Each clause should have one primary functional path where possible. Secondary paths require a genuine cross-functional role; general relevance is insufficient. Range labels may appear in narrative summaries but never as clickable anchor values.

Variation belongs primarily under Scope & Works when the issue is change to the Works or scope. Its time, price and claim-procedure consequences may cross-link respectively to Time & Completion, Price & Payment, and Claims & Dispute Procedure.

---

## 5. Tag Layer Treatment

Tags apply to clause elements, not to whole clauses by default. All tag names, definitions, distinctions and QC rules are governed by `project-control/08_TAG_DICTIONARY_AND_TAGGING_RULES.md`. Generic Claim, generic EOT and undifferentiated Breach / Default are not approved standalone tags.

---

## 6. Dashboard Interaction Rules

Functional Skeleton, Clause Spine and Tag View must resolve to the same source clause records, elements, approved tags, tag reasons and available review statuses. Clause links must open the corresponding concrete Clause Spine record. Blank source text must never be silently displayed.

---

## 7. Replication Rules for Other Systems

Scope & Works is the template for Time & Completion, Price & Payment, Risk Allocation, Claims & Dispute Procedure, Suspension & Termination, Testing, Taking Over & Defects, and Contract Administration.

Replicate the hierarchy, primary/secondary mapping discipline, individual clause anchors, three-type element methodology, approved tag dictionary, source-layer separation and cross-view consistency. Do not copy Scope practice categories into another system and do not revert to a FIDIC-heading-based structure.

---

## 8. Items Not to Change Without Approval

- the four approved Scope & Works practice categories;
- the governing four-level hierarchy;
- the three approved element types;
- the approved legal-effect tag dictionary;
- express-wording tagging requirements;
- primary/secondary mapping rules;
- individual clickable clause-anchor requirements; and
- separation of source, PDF verification and lawyer-review status.

Codex must not create legal analysis, tags, mappings or clause interpretations outside the approved methodology unless expressly instructed.
