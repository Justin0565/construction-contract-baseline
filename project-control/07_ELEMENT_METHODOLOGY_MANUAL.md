# 07_ELEMENT_METHODOLOGY_MANUAL

## Clause Element Extraction Methodology v1.2

This manual is the governing project-control methodology for extracting clause elements, applying legal-effect tags and converting contract mechanisms into review checklists.

Use this manual together with `project-control/01_Dashboard_Classification_Methodology_Memo.md`, `project-control/08_TAG_DICTIONARY_AND_TAGGING_RULES.md` and `project-control/09_SCOPE_BASED_DASHBOARD_STANDARD.md`.

---

## 1. Clause Element Definition

Clause = source contract text.

Path = the functional location of the issue in the contract system.

Element = the smallest functional contract mechanism inside a clause that can be reviewed, compared, tagged, or converted into a checklist question.

Tag = the legal effect created by an element.

Checklist = the use of elements to test another contract for missing, weaker, stronger, or risk-shifted mechanisms.

Do not treat every sentence as an element.

Do not treat every defined term as an element.

Do not treat every exception as a standalone element.

An element should be capable of answering at least one of the following:

- What obligation or responsibility is being allocated?
- How is the matter procedurally controlled?
- What contractual outcome or legal effect follows?
- Can this mechanism be converted into a checklist question for reviewing another construction contract?

---

## 2. Approved Element Types

### 2.1 Responsibility / Obligation Allocation

责任 / 义务配置

This answers:

Who is responsible for what?

Examples:

- Employer must give access and possession.
- Contractor must execute and complete the Works.
- Contractor remains responsible for Subcontractors.
- Employer must provide specified permits.

### 2.2 Process Control

过程控制

This answers:

How, when, and through what notice, submission, approval, certification, record, or determination process is the matter administered?

This includes:

- notice
- time limits
- submission
- instruction
- consent
- approval / no-objection
- records
- supporting documents
- certification
- agreement / determination

Examples:

- Contractor gives Notice within the stated period.
- Engineer issues an instruction.
- Contractor submits a proposal.
- Engineer proceeds under Sub-Clause 3.7.
- Contractor keeps Daywork records.
- Contractor submits supporting documents with payment application.

### 2.3 Legal Effect / Outcome Control

法律效果 / 结果控制

This answers:

What contractual effect follows if the matter occurs, is approved, is rejected, is delayed, is not performed, or is otherwise triggered?

This includes both positive and negative contractual effects.

Examples:

- Contractor is entitled to EOT.
- Contractor is entitled to Cost Plus Profit.
- Consent is deemed given.
- Contract Price is adjusted.
- Engineer may reject.
- Employer may deduct.
- Contractor must remedy.
- Employer may terminate.
- Claim is time-barred.

---

## 3. Deprecated Element Types

The previous element taxonomy is deprecated. The following must not be used as standalone element types.

### 3.1 Subject Matter / Scope

Reason:

Subject matter is normally already captured by:

- functional path
- practice category
- performance node
- clause heading
- clause title

It may be recorded as optional metadata for search or display, but not as an element type.

### 3.2 Exception / Carve-out

Reason:

Exceptions, carve-outs, exclusions, conditions and qualifications should generally be recorded as qualifiers or limitations to the relevant element.

They should not be separated into artificial standalone elements unless the clause itself is principally a risk allocation mechanism.

### 3.3 Evidence / Record

Reason:

Evidence and record requirements are part of Process Control where relevant.

### 3.4 Timing

Reason:

Timing is part of Process Control where relevant.

### 3.5 Procedure

Reason:

Procedure is now captured within Process Control.

### 3.6 Consequence

Reason:

Use Legal Effect / Outcome Control instead. The term “consequence” is too narrow because legal effects include both positive outcomes and negative consequences.

### 3.7 Risk Allocation

General risk-allocation wording should normally be recorded as a qualifier or limitation to the relevant element. A separate mechanism should be extracted only where the clause is principally a risk-allocation mechanism.

---

## 4. Qualifier / Limitation Rule

Record the following as qualifiers or limitations to the relevant element:

- subject to
- unless
- except where
- to the extent that
- provided that
- excluding
- without prejudice to
- notwithstanding
- carve-outs
- risk allocation limitations
- entitlement exclusions

Example:

Clause 2.1 Right of Access to the Site

Element type:

Legal Effect / Outcome Control

Element:

Delayed access relief

Core mechanism:

Contractor may be entitled to EOT and/or Cost Plus Profit if the Employer fails to give access or possession.

Qualifier / limitation:

No entitlement to the extent caused by Contractor’s error or delay.

Do not create a separate “Contractor error carve-out element” unless needed for checklist clarity.

---

## 5. Worked Example 1 — Clause 2.1 Right of Access to the Site

### Element 1

Element type:

Responsibility / Obligation Allocation

Element name:

Employer access obligation

Core mechanism:

Employer must give Contractor access and possession of the Site.

### Element 2

Element type:

Process Control

Element name:

Timing / manner of access

Core mechanism:

Access is given within the time and manner required by the Contract and may be non-exclusive.

### Element 3

Element type:

Legal Effect / Outcome Control

Element name:

Delayed access relief

Core mechanism:

If Employer fails to give access or possession and Contractor suffers delay and/or Cost, Contractor may be entitled to EOT and/or Cost Plus Profit.

Qualifier / limitation:

No entitlement to the extent caused by Contractor’s error or delay.

Tags:

- Claim for EOT
- Claim for Cost

---

## 6. Worked Example 2 — Clause 13.3.1 Variation by Instruction

### Element 1

Element type:

Responsibility / Obligation Allocation

Element name:

Contractor obligation to execute instructed Variation

Core mechanism:

Contractor must execute the instructed Variation.

### Element 2

Element type:

Process Control

Element name:

Contractor proposal and Engineer agreement / determination mechanism

Core mechanism:

Contractor submits the required details / proposal, and the Engineer agrees or determines the adjustment under Sub-Clause 3.7.

### Element 3

Element type:

Legal Effect / Outcome Control

Element name:

EOT / Contract Price adjustment

Core mechanism:

EOT and/or Contract Price adjustment may be agreed or determined.

Qualifier / limitation:

Ordinary Variation adjustment is not treated as a Contractor Claim under Sub-Clause 20.2.

Tags:

- Determination

Do not tag:

Do not tag ordinary 13.3.1 Variation adjustment as Claim for EOT or Claim for Cost unless the clause wording expressly creates or regulates such a Contractor claim.

---

## 7. Checklist Conversion Rule

An element is not complete unless it can be converted into a checklist question.

Examples:

For site access:

- Does the contract impose an express obligation on the Employer to provide access and possession?
- Does the contract state when access must be provided?
- Does delayed access give the Contractor EOT?
- Does delayed access give the Contractor Cost / Cost Plus Profit?
- Is relief excluded where the delay is caused by the Contractor?

For subcontracting:

- Does the contract require prior consent before appointing a subcontractor?
- Is consent deemed if no objection is issued within a stated period?
- Does the Contractor remain responsible for subcontractor acts and defaults?
- Does the nominated subcontractor mechanism include back-to-back obligations?
- Is there a deduction mechanism for Employer direct payment to nominated subcontractors?

---

## 8. Tagging Rules Reminder

All legal-effect tagging is governed by `08_TAG_DICTIONARY_AND_TAGGING_RULES.md`.

Do not tag merely by legal intuition. Tags are applied to elements, not to the whole clause by default.

Do not use generic `EOT` or generic `Claim` as standalone approved tags. Use `Claim for EOT` and `Claim for Cost` only where their express-wording definitions are satisfied. Use `Contractor Breach / Default` or `Employer Breach / Default` according to the party whose express non-performance wording appears.

---

## 9. Governing Status

This v1.2 manual supersedes any earlier project-control guidance that treated Subject Matter / Scope, Timing, Procedure, Consequence, Evidence / Record, Exception / Carve-out or general Risk Allocation as standalone element types.

If an older historical record is retained, it must be marked:

```text
Deprecated — superseded by Clause Element Extraction Methodology v1.2
```
