# Particular Conditions Review — Phase 1 Implementation Report

## Scope completed

This implementation is limited to the approved Phase 1 architecture/data-model definition and the visual shell of Phase 2. It does not implement amendment extraction, an Amendment Register, clause alignment, consolidation, Effective Contract views, functional/tag overlays, verification, export, persistence, or risk profiling.

## Existing architecture identified

The project is a static single-page application served from `index.html`, styled by `styles.css`, and controlled by one vanilla JavaScript file, `app.js`. It has no build system, package manager, framework, backend, database, or external browser API call.

The existing FIDIC 2017 Baseline has three sibling tab panels:

1. Functional Skeleton — embedded top-level contract-system structure plus `data/scope_works_v1.json` for the approved Scope & Works content layer.
2. Clause Spine — `app.js` loads `data/processed/fidic_2017_red_clauses.json` at runtime; the committed `data/fidic_2017_red_clauses.json` and schema provide supporting/portable source structures.
3. Tag View — controlled tag definitions and mappings are supported by `data/tags.json`, `data/tag_clause_index.json`, `data/clause_elements.json`, and Scope tag indexes.

Clauses, elements and tags are linked by stable IDs and concrete clause numbers. Scope performance nodes carry individual clause anchors. Clause-element records identify source clauses and tag IDs. Tag mappings resolve back to the same source clause records used by Clause Spine.

The new Particular Conditions Review workspace is a separate top-level UI container. Switching to it hides, but does not rebuild or mutate, the baseline container. No baseline JSON is written by the PC workspace.

## Files inspected

- `README.md`
- `index.html`
- `app.js`
- `styles.css`
- all six files in `project-control/`
- all committed JSON files in `data/`
- `data/processed/fidic_2017_red_clauses.schema.json`
- current Git status and recent repository state
- existing import and verification utilities in `scripts/`

## Files created

- `docs/specifications/PC_REVIEW_MASTER_SPEC.md`
- `reports/PC_REVIEW_PHASE_1_IMPLEMENTATION_REPORT.md`

## Files modified

- `index.html`
- `app.js`
- `styles.css`

No baseline JSON file was modified.

## Implemented architecture

- Top-level workspace selector:
  - FIDIC 2017 Baseline
  - Particular Conditions Review
- Existing baseline view selector remains intact inside the baseline workspace.
- PC Review internal navigation displays all seven planned views. Only Overview and Source Intake are enabled in this phase; later-phase views are visibly disabled.
- Overview shell shows project identity, the three-layer model, processing status, and honest disabled downstream actions.
- Source Intake shell provides all Phase 2 project setup fields and a local file-selection/drop target.
- TXT is read locally into browser memory and marked `Text Extracted`; this does not imply amendments were identified.
- Structured JSON is accepted only after the Phase 1 intake schema gate.
- DOCX and PDF are registered as source documents and marked `Requires Preprocessing`; no text is fabricated.
- No browser storage or external transmission is used.

## Proposed JSON schemas

These are proposals for review, not implemented production data files.

### 1. PC project/intake package

```json
{
  "schema_version": "1.0",
  "project": {
    "project_id": "string",
    "project_name": "string",
    "contract_reference": "string|null",
    "fidic_form": "Red Book",
    "fidic_edition": "2017",
    "source_baseline": "FIDIC Red Book 2017",
    "notes": "string|null"
  },
  "source_document": {
    "source_document_id": "string|null",
    "file_name": "string",
    "file_type": "txt|json|docx|pdf",
    "upload_date": "ISO-8601|null",
    "processing_status": "controlled status",
    "verification_status": "controlled status",
    "text": "string|null"
  }
}
```

The current UI validates only `schema_version`, `project.project_name`, `source_document.file_name`, and `source_document.file_type`. A stricter versioned schema should be approved before persistent imports are implemented.

### 2. Amendment overlay

```json
{
  "schema_version": "1.0",
  "project_id": "string",
  "baseline_id": "fidic_red_2017",
  "amendments": [
    {
      "amendment_id": "string",
      "pc_source_file": "string",
      "pc_source_reference": "string",
      "pc_instruction_text": "string",
      "target_gc_clause_id": "string|null",
      "target_gc_clause_number": "string|null",
      "target_gc_heading": "string|null",
      "pc_clause_number": "string|null",
      "pc_clause_heading": "string|null",
      "parent_clause": "string|null",
      "amendment_operation": "controlled operation",
      "target_text": "string|null",
      "replacement_or_added_text": "string|null",
      "sequence_number": 0,
      "alignment_status": "controlled alignment status",
      "application_status": "controlled application status",
      "verification_status": "controlled verification status",
      "effective_clause_id": "string|null",
      "effective_location": "string|null",
      "affected_element_ids": [],
      "affected_tag_ids": [],
      "global_dependency_ids": [],
      "notes": "string|null",
      "human_review_required": true,
      "source_confidence": null,
      "document_compare_change_id": null
    }
  ]
}
```

This schema is deferred until the user approves Phase 3. It preserves exact PC instructions and permits one-to-many/many-to-one relationships without writing back to baseline data.

### 3. Effective Contract layer

```json
{
  "schema_version": "1.0",
  "project_id": "string",
  "baseline_id": "fidic_red_2017",
  "generation_status": "Not yet implemented",
  "clauses": [
    {
      "effective_clause_id": "string",
      "baseline_clause_id": "string|null",
      "clause_no": "string",
      "clause_heading": "string",
      "effective_text": "string|null",
      "change_status": "Unchanged|Amended|Replaced|Deleted|New|Contract Data Applied|Global Amendment Applied|Unresolved",
      "applied_amendment_ids": [],
      "verification_status": "controlled verification status",
      "source_links": []
    }
  ]
}
```

This schema is proposed only. No Effective Contract records or text are generated in this phase. Risk-profile fields are intentionally not added until separately reviewed, as directed.

## Tag-taxonomy review

The Master Specification is broadly consistent with the current approved 18-tag dictionary. One wording point requires control:

- The current project taxonomy does not permit a generic `Breach / Default` tag. It uses separate `Contractor Breach / Default` and `Employer Breach / Default` tags.
- The Master Specification's references to “Breach / Default” are therefore treated as a general rule about express wording, not authorization to create a new generic tag.
- Generic `EOT` and generic `Claim` remain prohibited. The approved tags are `Claim for EOT` and `Claim for Cost`.

No tag definition, tag mapping, element, or legal analysis was changed in this phase.

## Static-architecture limitations

- Browser memory is session-scoped and is not permanent legal-document storage.
- TXT can be read, but the browser does not identify legal amendments from it.
- JSON validation is intentionally a minimal Phase 1 gate, not full semantic validation.
- DOCX/PDF cannot be reliably parsed by the current browser code and therefore require offline preprocessing.
- No automatic clause alignment, amendment sequencing, consolidation, Word Compare, DOCX/PDF export, or two-way verification exists.
- Disabled navigation/actions are visible architectural placeholders and never report success.
- A static browser cannot securely call external AI services or persist authoritative project records without a separately approved architecture.

## Validation performed

- JavaScript syntax check passed using the bundled current Node.js runtime.
- `git diff --check` passed.
- Browser reload produced no console errors.
- The default FIDIC Baseline workspace loaded and displayed its existing Functional Skeleton.
- Workspace switching displayed the PC Review Overview and its source navigation.
- The Overview displayed the three-layer separation and honest not-implemented statuses.
- Source Intake UI and status branches were code-reviewed; final file-picker interaction should also be manually checked using the instructions below because automated browser control cannot operate the native file chooser in this environment.

## Manual test instructions

1. Serve the repository locally and open `http://127.0.0.1:8000/`.
2. Confirm `FIDIC 2017 Baseline` is selected and test Functional Skeleton, Clause Spine and Tag View.
3. Select `Particular Conditions Review`.
4. Confirm Overview shows the three-layer model and honest processing timeline.
5. Select `Source Intake` or use `Open Source Intake`.
6. Enter a project name and contract reference.
7. Select a `.txt` file and confirm `Text Extracted` plus `Human Review Required`.
8. Select a conforming intake `.json` file and confirm it passes the schema gate without amendment processing.
9. Select a `.docx` or `.pdf` and confirm `Requires Preprocessing` and the statement that text was not extracted.

## Confirmation

The FIDIC baseline source and mapping JSON remain unchanged. No backend, React, Next.js, npm dependency, database, external service, automatic legal analysis, or risk scoring was introduced.
