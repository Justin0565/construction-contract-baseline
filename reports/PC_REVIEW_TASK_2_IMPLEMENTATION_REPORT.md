# Particular Conditions Review — Task 2 Implementation Report

## 1. Scope completed

Task 2 implements the functional Particular Conditions Review data foundation, local Source Intake workflow, Amendment Register, and complete project JSON export/re-import path.

The stop boundary was observed. No automatic amendment extraction, clause alignment, target matching, amendment application, consolidation, Effective Contract generation, document compare, Functional Skeleton overlay, Tag View overlay, global-amendment application, or risk scoring was implemented.

## 2. Files inspected

- `docs/specifications/PC_REVIEW_MASTER_SPEC.md`
- `reports/PC_REVIEW_PHASE_1_IMPLEMENTATION_REPORT.md`
- `index.html`
- `app.js`
- `styles.css`
- `README.md`
- all six `project-control/*.md` control files
- current committed and runtime JSON structures under `data/`
- existing offline import/verification utilities under `scripts/`
- Git status and current uncommitted Task 1 changes
- the current browser-rendered Baseline and PC Review workspaces

## 3. Files created in Task 2

- `data/schemas/pc_review_project.schema.json`
- `data/schemas/pc_structured_amendment_input.schema.json`
- `data/demo/pc_review_project_demo.json`
- `reports/PC_REVIEW_TASK_2_IMPLEMENTATION_REPORT.md`

The Task 1 specification and report remain present and unchanged in purpose.

## 4. Files modified

- `index.html`
- `app.js`
- `styles.css`

No pre-existing baseline JSON file was modified.

## 5. Implemented data schemas

### Review package envelope

The canonical export discriminator is:

```json
{
  "schema_version": "pc-review-project-1.0",
  "document_type": "pc_review_project",
  "export_timestamp": null,
  "project": {},
  "source_documents": [],
  "amendments": [],
  "processing_history": []
}
```

### Structured amendment input envelope

The separate intake discriminator is:

```json
{
  "schema_version": "pc-amendment-input-1.0",
  "document_type": "pc_structured_amendment_input",
  "source_document": {},
  "amendments": []
}
```

The explicit `document_type` prevents the browser from guessing whether a JSON document is a complete review project or structured amendment input.

### Entities implemented

- Review Project: all Task 2 project identity, fixed baseline, timestamps, statuses, ID references and notes fields.
- Source Document: file metadata, selection time, role, extraction/preprocessing/processing/verification states, exact TXT, extraction method/error, optional SHA-256 and notes.
- Amendment Register Entry: every field required by Task 2. Alignment/effective/element/tag fields are fixed to `null`, `[]`, or `Not Assessed`; verification is fixed to `Not Verified`.
- Processing History: timestamped source/amendment/project status events with actor and notes.

Defined-term and Global Amendment entries receive `Identified – Deferred`; they are not applied.

## 6. Vanilla JavaScript validation

No package was added. Explicit validation checks include:

- root type, `document_type`, and schema version;
- fixed Red Book / 2017 / `fidic_red_2017` benchmark;
- `Not Verified` baseline and amendment verification status;
- required arrays, unique source/amendment IDs, and project/reference consistency;
- file type, non-negative file size, document role and optional SHA-256 format;
- controlled amendment categories and operations;
- deferred category/operation pairing;
- required exact instruction and source reference;
- required target/replacement operands for relevant operations;
- unclassified instructions requiring human review;
- rejection of populated alignment, effective clause, element, tag and risk fields;
- rejection of unsafe prototype-related JSON keys;
- transparent warnings for unrecognised top-level fields.

Validation is performed before state mutation. Failed JSON intake does not alter the current project.

Unknown fields in a complete project are preserved by whole-object re-import. Unknown top-level fields in structured amendment input are recorded in import metadata; amendment/source object fields are round-tripped with their records.

## 7. Source Intake behaviour

### Fully supported in the static prototype

- Project creation and project metadata update.
- TXT selection, exact `FileReader.readAsText` capture, limited preview and complete-text export.
- Complete PC Review Project JSON validation, summary, confirmation and replacement import.
- Structured amendment-input JSON validation and manual-review import.
- Drag/drop and native file selection.
- Optional SHA-256 through browser `crypto.subtle` when available.
- Clear active source, with confirmation and referential-integrity protection.

### Requires preprocessing

- DOCX
- PDF

These files are registered with filename, type, size, timestamp and optional hash. Their text remains `null`; extraction is `Not Extracted`; preprocessing/processing are `Requires Preprocessing`. No dependency, parser, or fabricated text was added.

## 8. Amendment Register functions completed

- Empty-state guidance.
- Working table with all requested columns.
- Category, operation, alignment, application, verification and human-review filters.
- Expandable row showing the exact PC instruction and separate summary.
- Manual entry creation.
- Editing of manual or imported entries.
- Deletion with native confirmation.
- Field validation before saving.
- Exact instruction preservation, including leading/trailing whitespace and line breaks.
- Separate optional summary that never overwrites the source instruction.
- Processing-history events for create/edit/delete/import actions.

No target clause is inferred. Target GC fields remain visibly `Not Assessed` in the editor and null in data.

## 9. Import and export behaviour

- Export serialises the full canonical package, exact TXT, source metadata, amendments, history, schema version and export timestamp.
- The filename is generated from the project name.
- A visible prepared-download link remains available if an automatic browser download is blocked.
- Re-import first shows project identity, source count, amendment count and validation warnings.
- Replacement requires confirmation where current state exists.
- Projects are not merged automatically.
- Browser memory is the only working store; no full PC text is placed in localStorage.

## 10. DEMO fixture

`data/demo/pc_review_project_demo.json` is clearly labelled DEMO and contains no FIDIC contractual wording. It includes:

- one TXT source record;
- one clause-specific exact-text replacement;
- one new-clause entry;
- one deferred defined-term amendment;
- one ambiguous/unclassified human-review item.

All target-GC, alignment, effective, element and tag fields remain unassessed.

## 11. Tests performed

Passed:

- current Node runtime syntax check for `app.js`;
- JSON parsing for both schema documents and the DEMO fixture;
- `git diff --check`;
- Functional Skeleton browser load;
- Clause Spine browser load;
- Tag View browser load;
- PC workspace and all enabled internal navigation;
- project creation with stable browser-session metadata;
- TXT local read, exact preview, `Text Extracted`, and `Amendments Not Yet Identified` state;
- malformed JSON rejection without changing the registered source count;
- complete DEMO project JSON validation and re-import;
- replacement confirmation for a non-empty current project;
- PDF and DOCX `Not Extracted` / `Requires Preprocessing` handling;
- Amendment Register four-row fixture load;
- category filter reducing four rows to the expected one row;
- row expansion and exact source instruction;
- manual amendment creation and editing;
- preservation of a multiline exact instruction;
- rejection of an invalid defined-term category/operation pairing;
- export package preparation and persistent download link;
- 624 px viewport without document-level horizontal overflow;
- no browser console errors.

The browser automation surface did not emit a download event for a browser-created Blob URL. The UI did create the canonical JSON Blob, requested the project-specific filename, and exposed a persistent download link. The final file-save appearance should be confirmed manually in the user's browser.

The delete action's native confirmation gate was triggered during testing. Destructive confirmation acceptance was not automated; manual acceptance is included in the test instructions.

## 12. Existing taxonomy issue observed

Task 2 does not alter the baseline taxonomy. The authoritative project-control files and current Scope/app logic use the approved 18 legal-effect tags. The legacy `data/tags.json` still reflects an older 14-tag structure containing deprecated generic labels. Task 2 does not read that file to infer or populate amendment tags, and every Task 2 `affected_tag_ids` array remains empty.

The seven top-level functional-category labels supplied separately by the user were not applied in this task because Task 2 expressly prohibits altering the existing Functional Skeleton content. They require a separate approved control/data/UI migration decision.

## 13. Known limitations

- Browser memory is temporary; export is required to preserve state.
- DOCX/PDF require offline preprocessing.
- JSON validation is explicit vanilla JavaScript rather than a third-party JSON Schema engine.
- Standard `JSON.parse` cannot detect duplicate keys inside one JSON object.
- The UI does not extract amendments from TXT or infer any legal relationship.
- No merge, alignment, application, consolidation, overlay, risk analysis, verification or publication exists.
- The in-app automated browser did not expose completion of Blob downloads, so actual filesystem save must be manually confirmed.

## 14. Baseline and technical confirmations

- FIDIC clause text was not modified.
- No baseline mapping/source JSON was overwritten.
- Functional Skeleton, Clause Spine and Tag View still work.
- No React, Next.js, npm, backend, database or external AI/API call was introduced.
- Task 3 has not been started.
- No commit or push was performed.

## 15. Browser test steps

1. Serve `C:\Projects\construction-contract-baseline` and open `http://127.0.0.1:8000/`.
2. Check the three views under `FIDIC 2017 Baseline`.
3. Select `Particular Conditions Review`, then `Source Intake`.
4. Enter a project name and choose `Create review project`.
5. Select a TXT file; confirm exact preview, `Text Extracted`, `Amendments Not Yet Identified`, and `Not Verified`.
6. Select a DOCX or PDF; confirm `Not Extracted` and `Requires Preprocessing`.
7. Select `Load DEMO review-project fixture`, review the validation summary, and confirm import.
8. Open `Amendment Register`; expand rows and test the six filters.
9. Add an entry, edit it, then delete it and accept the confirmation only if you intend to remove the DEMO entry.
10. Open `Overview`, choose `Export review project JSON`, and save the project-specific file.
11. Use `Re-import review project JSON`, select the exported file, review its identity/count summary, and confirm replacement.
