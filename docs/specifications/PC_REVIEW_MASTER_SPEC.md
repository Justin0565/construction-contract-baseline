Work only within:

C:\Projects\construction-contract-baseline

Do not access, create, modify, move or delete files outside this project directory.

## 1. Project background

The existing project is a static Construction Contract Intelligence Dashboard for the FIDIC Red Book 2017 General Conditions.

The following existing baseline interfaces have already been developed:

1. Functional Skeleton;
2. Clause Spine;
3. Tag View;
4. Scope & Works v1 content logic;
5. FIDIC Red Book 2017 clause source layer, currently being verified against the source PDF.

The existing FIDIC Red Book 2017 interface is the immutable benchmark layer. It must not be replaced, overwritten or converted into a project-specific contract.

The purpose of this task is to add a separate top-level workspace called:

Particular Conditions Review

This new workspace will allow a user to load the Particular Conditions of a project, align them with the verified FIDIC Red Book 2017 General Conditions, review the amendments, and eventually generate:

1. an Effective Contract clean copy;
2. a structured Amendment Register;
3. a comparison against the FIDIC baseline;
4. an Effective Contract Clause Spine;
5. an Effective Contract Functional Skeleton;
6. an Effective Contract Tag View;
7. a verification report;
8. a data foundation for future risk profiling and clause-level risk scoring.

Do not implement any legal conclusion, risk score or contractual interpretation that has not been expressly confirmed.

## 2. Mandatory technical restrictions

The project must remain based on:

* static HTML;
* static CSS;
* vanilla JavaScript;
* JSON data.

Do not introduce:

* React;
* Next.js;
* npm;
* Flask;
* FastAPI;
* a database;
* a web server backend;
* API keys embedded in browser code;
* calls from the browser directly to OpenAI, Claude or any other external AI service.

Do not install new packages without first reporting why they are required.

The browser interface may read local files selected by the user through a file input, but it must not pretend that an unsupported PDF or DOCX file has been semantically processed.

If the existing project does not already contain a reliable local DOCX or PDF parser:

* support TXT and structured JSON input in the initial processing workflow;
* allow DOCX and PDF files to be selected and registered as source documents;
* clearly display their status as “Requires preprocessing”;
* do not fabricate extracted text;
* do not mark the document as parsed or verified;
* design the intake layer so that DOCX/PDF extraction can be added later without redesigning the interface.

Any future Python utility must be an offline preprocessing tool only, not a backend service. Do not create such a Python utility in this task unless one already exists in the repository or its creation is separately authorised.

## 3. First inspect the existing project

Before editing:

1. inspect the complete project structure;

2. identify the current HTML entry points;

3. identify the existing navigation logic;

4. identify the JSON files supporting:

   * Functional Skeleton;
   * Clause Spine;
   * Tag View;
   * Scope & Works;

5. identify how clauses, elements and tags are currently linked;

6. inspect git status, if this is a git repository;

7. preserve all existing user changes;

8. do not commit or push;

9. do not rewrite working components merely to make the code stylistically different.

Use the current design language, CSS variables, typography, colours, card styles and interaction patterns.

The existing FIDIC Red Book 2017 Dashboard must continue to work exactly as it does now.

## 4. Top-level information architecture

Do not place all new controls directly into the existing three-view selector.

Introduce a higher-level workspace selector:

* FIDIC 2017 Baseline
* Particular Conditions Review

When “FIDIC 2017 Baseline” is selected, preserve the existing interface and its existing view selector:

* Functional Skeleton;
* Clause Spine;
* Tag View.

When “Particular Conditions Review” is selected, provide the following internal views:

1. Overview;
2. Source Intake;
3. Amendment Register;
4. Clause Spine;
5. Functional Skeleton;
6. Tag View;
7. Verification.

The navigation must make it visually clear whether the user is viewing:

* the immutable FIDIC baseline; or
* a project-specific Effective Contract.

## 5. Particular Conditions project setup

The Particular Conditions Review workspace must begin with a project setup/intake panel.

Provide fields for:

* project or contract name;
* contract reference;
* FIDIC form;
* FIDIC edition;
* source baseline;
* Particular Conditions source file;
* source file type;
* upload date;
* processing status;
* verification status;
* optional notes.

For the current version, the only selectable benchmark should be:

FIDIC Red Book 2017

Do not create unsupported FIDIC editions or forms.

Provide a drag-and-drop/file-selection area for Particular Conditions.

The interface may accept:

* .txt;
* .json;
* .docx;
* .pdf.

However:

* TXT may be read as text;
* JSON may be read only after schema validation;
* DOCX/PDF must be marked “Requires preprocessing” unless a reliable parser already exists;
* no file should be uploaded to an external service;
* the browser must display a privacy notice confirming that the file remains local in the current prototype.

## 6. Processing state model

Use a transparent workflow status model:

1. Source Loaded;
2. Text Extracted;
3. Amendments Identified;
4. Clause Alignment Review;
5. Clause-specific Consolidation;
6. Global Amendments Pending;
7. Effective Clean Draft Generated;
8. Comparison Pending;
9. Verification in Progress;
10. Verified;
11. Published to Effective Contract Dashboard.

Also support:

* Requires Preprocessing;
* Ambiguous;
* Unmatched;
* Blocking Dependency;
* Human Review Required;
* Failed Validation.

Do not use a single generic “Complete” status.

## 7. Preserve the baseline as an immutable layer

The existing verified FIDIC data must remain unchanged.

Create a three-layer data model:

### Layer 1: FIDIC Baseline

The verified FIDIC Red Book 2017 General Conditions, including:

* clause text;
* clause number;
* clause heading;
* baseline elements;
* baseline functional mapping;
* baseline tags;
* baseline checklist links.

### Layer 2: Amendment Overlay

The structured Particular Conditions amendments, including:

* source reference;
* target clause;
* operation;
* original wording;
* amendment wording;
* application status;
* verification status.

### Layer 3: Effective Contract

The project-specific consolidated contract produced by applying verified amendments to the baseline.

Never write project amendments back into the baseline JSON.

## 8. Clause Alignment and Target Validation Gate

Before applying any amendment, compare:

* FIDIC form;
* edition;
* parent clause;
* Sub-Clause number;
* Sub-Clause heading;
* quoted target wording;
* amendment operation;
* amendment sequence.

Use the following alignment statuses:

* Exact Match;
* Number Match / Heading Difference;
* Heading Match / Number Difference;
* Target Text Match;
* Probable Match;
* Ambiguous;
* Unmatched;
* New Clause;
* Blocking Dependency.

Only “Exact Match” and an independently validated “Target Text Match” may be eligible for automatic application.

Do not apply an amendment merely because the clause number appears to match.

Where a clause number, heading or quoted target text conflicts with the baseline:

* preserve the PC wording exactly;
* display the conflicting information;
* mark the item for human review;
* do not guess the intended clause;
* do not silently correct the Particular Conditions.

The mapping is not necessarily one PC entry to one GC clause. Support:

* one amendment to one clause;
* one amendment to several clauses;
* several amendments to the same clause;
* a new clause;
* a document-wide amendment.

## 9. Amendment classification

Support the following amendment operations:

* Delete Exact Text;
* Delete Paragraph;
* Delete Entire Sub-Clause;
* Replace Exact Text;
* Replace Paragraph;
* Replace Entire Sub-Clause;
* Insert Before;
* Insert After;
* Add Paragraph;
* Add New Sub-Clause;
* Amend Clause Heading;
* Complete Contract Data;
* Renumber;
* Amend Cross-reference;
* Amend Defined Term;
* Global Amendment;
* Unclassified Instruction.

Do not implement the original simplistic rule that every addition is appended to the end of a clause.

An addition must be applied only to the precise location identified by the Particular Conditions.

If the insertion location is unclear, classify the amendment as “Ambiguous” and require human review.

## 10. Particular Conditions Amendment Register

Create a structured Amendment Register with at least the following fields:

* amendment_id;
* project_id;
* pc_source_file;
* pc_source_reference;
* pc_instruction_text;
* target_gc_clause_id;
* target_gc_clause_number;
* target_gc_heading;
* pc_clause_number;
* pc_clause_heading;
* parent_clause;
* amendment_operation;
* target_text;
* replacement_or_added_text;
* sequence_number;
* alignment_status;
* application_status;
* verification_status;
* effective_clause_id;
* effective_location;
* affected_element_ids;
* affected_tag_ids;
* global_dependency_ids;
* notes;
* human_review_required;
* source_confidence.

Preserve the exact PC instruction text.

Do not replace the source instruction with an AI-generated summary.

A short amendment description may be stored separately, but it must never replace the source wording.

## 11. Order of consolidation

Apply the following order:

### Stage A — identify all amendments

Identify and register:

* clause-specific amendments;
* Contract Data;
* defined-term amendments;
* global amendments;
* new clauses;
* unresolved instructions.

### Stage B — clause-specific amendments first

Prioritise amendments directed to specific clauses.

Apply them according to their sequence in the Particular Conditions.

Do not apply an amendment if its target is ambiguous.

### Stage C — defined-term and global amendments last

Defined-term and document-wide amendments must be identified and registered at the beginning but normally applied only after clause-specific consolidation has been completed.

Use the status:

Identified – Deferred

After application, use:

Applied and Revalidated

Exception: if a defined-term or global amendment is necessary to understand or apply a clause-specific amendment, mark it:

Blocking Global Dependency

Resolve it before applying the dependent clause-specific amendment.

After defined-term and global amendments are applied, revalidate all affected clauses.

## 12. Clean Effective Contract

The first consolidated output should be a clean Effective Contract, not a live redline.

The clean Effective Contract must:

* originate from the verified baseline text;
* preserve baseline numbering;
* preserve clause hierarchy;
* preserve headings;
* preserve paragraph boundaries where possible;
* preserve defined-term capitalisation;
* preserve punctuation unless expressly amended;
* preserve cross-references unless expressly amended;
* include new clauses in the correct position;
* retain a record of deleted clauses rather than silently losing their history.

Do not regenerate or paraphrase FIDIC wording.

Do not improve grammar or drafting unless the PC expressly requires that change.

For every effective clause, preserve the link to:

* the baseline clause;
* all PC amendments applied to it;
* the source location;
* the verification record.

## 13. Comparison and redline

The intended final redline workflow is:

1. generate the Effective Contract clean copy;
2. compare the clean copy against the verified FIDIC General Conditions full copy;
3. generate a redline version;
4. reconcile the redline against the Amendment Register.

The static browser does not need to reproduce Microsoft Word’s Document Compare function in this task.

For the Dashboard, create a structured amendment display based on the Amendment Register and application log.

Do not rely on a Word redline as the sole Dashboard data source.

The data model must nevertheless include fields for a future document-compare result and comparison change ID.

## 14. Two-way verification

Create a Verification view supporting two directions.

### PC to Effective Contract

For every PC instruction, confirm:

* it has been identified;
* it has a target;
* it has been applied to the correct clause;
* the deleted text is accurate;
* the added or replacement text is complete;
* the location is accurate;
* the sequence is correct;
* the resulting clause has been reviewed.

### Effective Contract changes to PC

For every difference between the baseline and Effective Contract, confirm:

* it is authorised by a PC instruction;
* it has a source reference;
* it is not an accidental wording change;
* it is not caused solely by formatting;
* it is not an unauthorised grammatical improvement;
* it has a verification status.

Display at least:

* total PC instructions;
* aligned;
* applied;
* verified;
* ambiguous;
* unmatched;
* unauthorised or unexplained differences;
* global amendments pending;
* blocking dependencies.

Do not mark the overall contract “Verified” while a material amendment remains unresolved.

## 15. Particular Conditions Clause Spine

Build the new Clause Spine from the Effective Contract layer while preserving its relationship to the baseline.

Each clause node must show:

* clause number;
* clause heading;
* amendment count;
* amendment status;
* verification status.

Support statuses:

* Unchanged;
* Amended;
* Replaced;
* Deleted;
* New;
* Contract Data Applied;
* Global Amendment Applied;
* Unresolved.

A deleted baseline clause must remain visible as a tombstone node stating:

Deleted by Particular Conditions

Do not simply remove it from the Clause Spine.

When a clause is selected, show:

### Effective Text

The clean project-specific clause.

### Changes

A structured legal-redline-style display:

* additions highlighted;
* deletions shown with strikethrough;
* replacements shown as deletion plus addition.

### FIDIC Baseline

The original verified baseline clause.

Also show an Amendment Basis panel containing:

* the exact PC instruction;
* PC source reference;
* operation;
* alignment status;
* application status;
* verification status;
* affected elements;
* affected tags.

Text-level redline may use red additions and red strikethrough deletions. Node-level status must also use written badges and must not rely only on colour.

## 16. Effective Functional Skeleton

Do not generate an unrelated second Functional Skeleton.

Use the existing FIDIC Functional Skeleton as the benchmark structure and apply an Effective Contract overlay.

Support the following element statuses:

* Unchanged;
* Modified;
* Added by PC;
* Removed by PC;
* Unresolved.

The element framework remains:

1. Responsibility / Obligation Allocation;
2. Process Control;
3. Legal Effect / Outcome Control.

Do not create “Subject Matter / Scope” as a separate element category. It may be retained only as optional search or display metadata.

Risk allocation, conditions, exceptions, carve-outs and limitations must be recorded as qualifiers or limitations of the relevant element.

Clicking a modified functional node should show:

* baseline element;
* effective element;
* amendment source;
* affected clauses;
* change status;
* verification status.

## 17. Effective Tag View

Do not alter the confirmed baseline tag taxonomy in this task.

The Effective Tag View must distinguish:

* Retained;
* Modified;
* Added by PC;
* Removed by PC;
* Pending Verification.

Apply the confirmed tag rules strictly.

In particular:

* do not create a standalone “EOT” tag;
* “Claim for EOT” requires an express Contractor claim or entitlement concerning extension of time, extension of Time for Completion, or extended time for completion;
* “Claim for Cost” requires an express Contractor claim or entitlement to Cost, additional payment, Cost Plus Profit or cost relief;
* “Breach / Default” requires express wording such as fail, failure, default, delay to perform or wording with the same confirmed effect;
* do not add a tag based only on general legal inference;
* do not automatically retain a baseline tag if the relevant wording has been deleted;
* do not automatically add a tag simply because the Particular Conditions modify the clause.

Clause 5 remains Subcontracting.

Clause 12 remains Measurement and Valuation.

## 18. Future risk-profile readiness

Do not calculate or display substantive risk scores in this task.

However, ensure the data model can later support FIDIC-benchmark risk profiling at element, clause, functional-module and overall-contract levels.

Reserve nullable fields for:

* benchmark_element_id;
* effective_element_id;
* amendment_id;
* affected_party;
* risk_direction;
* risk_category;
* benchmark_deviation;
* substantive_exposure;
* procedural_burden;
* financial_exposure;
* controllability;
* uncertainty;
* confidence;
* scoring_rule_id;
* risk_rationale;
* governing_law_review_status;
* risk_verification_status.

These fields must remain null or “Not Assessed” until a separately approved risk methodology is implemented.

Do not assume that every deviation from FIDIC is adverse.

Do not generate a black-box overall risk score.

## 19. User-friendly visual design

The interface must use progressive disclosure.

The first level should answer:

Which clauses have been amended?

The second level should answer:

What wording changed?

The third level should answer:

What contract function or legal-effect tag changed?

The fourth level should answer:

What is the PC source and verification status?

Do not display the baseline text, effective text, redline, amendments, elements and tags simultaneously in one crowded panel.

Provide global project-view controls:

* Effective Contract;
* Changes from FIDIC;
* FIDIC Baseline.

Provide filters for:

* amended clauses only;
* unresolved clauses;
* deleted clauses;
* new clauses;
* amendment type;
* verification status;
* affected function;
* affected tag.

Use badges, labels and icons together with colour.

Maintain keyboard accessibility, readable contrast and responsive behaviour.

## 20. Export and persistence for the static prototype

For the current static prototype:

* allow validated TXT/JSON intake to be held in browser memory;
* use localStorage only for non-sensitive prototype state if the project already follows that approach;
* provide an option to export the structured project data as JSON;
* provide an option to re-import that JSON;
* do not claim that browser localStorage is permanent legal document storage;
* do not transmit source documents externally;
* do not export a DOCX or PDF unless a reliable existing method is already present.

Create clear placeholder actions for:

* Generate Effective Clean Copy;
* Generate Document Compare;
* Run Two-way Verification;
* Publish to Effective Contract Dashboard.

A placeholder action must be visibly labelled “Not yet implemented” or “Requires preprocessing”. It must not display a false success message.

## 21. Validation and test fixture

Create a small synthetic test fixture to validate the workflow, but:

* clearly label it DEMO;
* do not invent or reproduce unverified FIDIC contractual wording;
* do not mix demo data with the verified baseline dataset;
* do not present demo results as legal analysis.

The fixture should test:

* one exact-text deletion;
* one exact-text replacement;
* one insertion at a specified location;
* one new clause;
* one ambiguous target;
* one deferred defined-term amendment;
* one deleted baseline element;
* one added tag;
* one removed tag.

## 22. Quality-control requirements

Before reporting completion:

1. confirm all existing FIDIC baseline views still load;
2. confirm no baseline JSON was overwritten;
3. validate every new JSON file;
4. confirm there are no browser console errors;
5. test workspace navigation;
6. test TXT intake;
7. test structured JSON import;
8. test unsupported DOCX/PDF status handling;
9. test Amendment Register filters;
10. test Clause Spine status badges;
11. test Effective/Baseline/Changes switching;
12. test unresolved amendment handling;
13. test export and re-import of project JSON;
14. inspect git diff;
15. list every file created or modified.

Do not perform a broad refactor unrelated to this task.

## 23. Implementation sequence

Implement in the following order:

### Phase 1 — Architecture and data model

* inspect the project;
* document how the new workspace connects to the existing Dashboard;
* define the JSON schemas;
* preserve baseline immutability.

### Phase 2 — Particular Conditions Review shell

* add the workspace selector;
* add Overview and Source Intake;
* add processing statuses;
* add project setup.

### Phase 3 — Amendment Register and Clause Alignment

* implement the register;
* implement alignment statuses;
* implement filters;
* implement the human-review queue.

### Phase 4 — Effective Contract views

* implement the project Clause Spine;
* implement Effective/Baseline/Changes tabs;
* implement the Amendment Basis panel.

### Phase 5 — Functional and Tag overlays

* connect effective elements to the existing Functional Skeleton;
* connect effective tags to the existing Tag View;
* preserve baseline/effective status distinctions.

### Phase 6 — Verification and export

* add the two-way verification interface;
* add JSON export/import;
* add honest placeholder states for unsupported processing.

Do not skip directly to AI extraction before completing the data model and review workflow.

## 24. Completion report

At the end, report:

1. the architecture implemented;
2. all files created;
3. all files modified;
4. which functions are fully working;
5. which functions are prototype-only;
6. which functions require preprocessing;
7. any unresolved technical limitation;
8. confirmation that the FIDIC baseline remains unchanged;
9. confirmation that no backend, React, Next.js or npm was introduced;
10. exact instructions for opening and testing the new Particular Conditions Review workspace.

If the requested functionality cannot be implemented honestly within the current static architecture, implement the valid foundation and clearly identify the limitation. Do not simulate successful legal processing.


