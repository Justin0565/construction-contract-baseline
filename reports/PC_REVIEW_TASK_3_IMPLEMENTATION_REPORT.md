# Particular Conditions Review — Task 3 Acceptance Report

Date: 2026-08-18  
Scope: Task 3 acceptance gate only. Task 4 has not started.

## 1. Result

**PASS.** The deterministic clause-alignment and clause-specific application layer passed the pure-function, JSON, Schema, browser, console, baseline-integrity and Git-diff gates described below. Invalid project imports were rejected before state replacement. No FIDIC source wording or baseline JSON was changed.

The subsystem remains explicitly **Preview / Unverified Baseline**. It does not publish an Effective Contract.

## 2. Files

### Task 3 files created

- `pc_alignment_engine.js` — pure deterministic alignment, eligibility, exact-application and replay functions.
- `scripts/test_pc_alignment_engine.js` — synthetic, baseline-isolated pure-function regression suite.
- `data/schemas/pc_review_project_v1_1.schema.json` — Task 3 project, Effective Clause, version and application-log schema.
- `data/schemas/pc_structured_amendment_input.schema.json` — structured-input control schema used by the Task 3 intake gate.
- `data/demo/pc_review_project_v1_1_demo.json` — valid Task 3 project fixture.
- `data/demo/pc_review_task3_demo.json` — isolated synthetic engine fixture; it is not a FIDIC baseline.
- `data/demo/pc_review_task3_intake_demo.txt` — local TXT-intake fixture containing no FIDIC wording.
- `data/demo/pc_structured_amendment_input_demo.json` — valid structured-input fixture.
- `data/demo/pc_structured_pdf_false_extraction_invalid_demo.json` — expected-invalid honest-status fixture.
- `reports/PC_REVIEW_TASK_3_IMPLEMENTATION_REPORT.md` — this report.

### Files modified

- `app.js` — controlled source gate, Task 3 state/rendering, validation, alignment, application, versioning, rollback and atomic import.
- `index.html` — Task 3 navigation and panels; Task 4 destinations remain disabled.
- `styles.css` — Task 3 UI and responsive styles.

### Earlier Phase 1 / Task 2 assets retained and inspected

- `docs/specifications/PC_REVIEW_MASTER_SPEC.md`
- `data/schemas/pc_review_project.schema.json`
- `data/demo/pc_review_project_demo.json`
- `reports/PC_REVIEW_PHASE_1_IMPLEMENTATION_REPORT.md`
- `reports/PC_REVIEW_TASK_2_IMPLEMENTATION_REPORT.md`

## 3. Supported alignment rules

The machine gate supports these evidence states:

- `Exact Match`
- `Target Text Match`
- `Number Match / Heading Difference`
- `Heading Match / Number Difference`
- `Probable Match`
- `Ambiguous`
- `Unmatched`
- `New Clause`
- `Blocking Dependency`
- `Not Assessed`

The rules are fail-closed:

- The production gate accepts only the controlled FIDIC Red Book 2017 source identity, 21 main clauses, 215 non-empty sub-clause records, unique IDs/numbers, valid hierarchy, correct Clause 5 and Clause 12 titles, the corrected-Word origin SHA-256 and the processed-layer SHA-256.
- Clause identity uses exact IDs/numbers. It does not use ancestor/descendant fallback.
- Heading normalisation is limited to harmless case, whitespace and punctuation-spacing differences. It does not delete words, numbers, defined terms or cross-references.
- Exact wording and anchors use literal, overlap-safe occurrence counting. Zero or multiple occurrences cannot be applied.
- `Current Effective Text` alignment reads the single valid Effective Clause current version; `Original Baseline Text` continues to use the immutable baseline record.
- Duplicate headings and repeated anchors are `Ambiguous`; fuzzy candidates are only `Probable Match` and never auto-applied.
- Human confirmation retains the machine result and evidence. It cannot bypass a missing/non-unique anchor, source failure or unresolved dependency.
- Only `Exact Match` or a current `Human Confirmed` decision can become eligible.

## 4. Supported and unsupported operations

### Supported in Task 3

1. `Delete Exact Text`
2. `Replace Exact Text`
3. `Insert Before`
4. `Insert After`
5. `Add Paragraph`
6. `Delete Entire Sub-Clause`
7. `Replace Entire Sub-Clause`
8. `Add New Sub-Clause`

All eight operations compute locally first and commit only after every precondition succeeds. The engine preserves the exact user-supplied replacement/insertion whitespace.

### Registered but not applied in Task 3

- `Delete Paragraph`
- `Replace Paragraph`
- `Amend Clause Heading`
- `Complete Contract Data`
- `Renumber`
- `Amend Cross-reference`
- `Amend Defined Term`
- `Global Amendment`
- `Unclassified Instruction`

Defined-term and Global amendments remain `Identified – Deferred`. Contract Data and other unsupported operations remain `Not Yet Supported / Human Review Required`. They are not converted into a supported operation.

## 5. Version-chain protections

Every imported Effective Clause must have:

- unique version IDs;
- contiguous zero-based version numbers;
- an initial version with no parent, no application creator, no active amendment and no change segments;
- each later version pointing exactly to the immediately preceding version;
- valid, non-decreasing ISO timestamps;
- one matching Applied or Rolled Back application-log creator for every later version;
- a creator whose input/output IDs, output text, timestamp and version event match the version;
- application-log and version-level redline segments that reconstruct the exact parent and output texts and carry the correct application/amendment/version provenance;
- a current pointer, number and text equal to the last version;
- active-amendment snapshots reproducible from immutable Applied records;
- current text, applied IDs, cumulative redline, tombstone flag and clause status reproducible by deterministic replay.
- every change segment containing its required ID, controlled segment type, exact array order and application/amendment/version provenance;
- required v1.1 root/entity fields present before the native semantic gate runs.

An import failure occurs before `pcReviewData` replacement. The tested invalid import left the live Workbench byte-for-byte unchanged and left no pending confirmation state.

### Version-chain adversarial results

| Invalid imported state | Result |
|---|---|
| Non-contiguous version number | Rejected |
| Missing parent version | Rejected |
| Incorrect parent reference | Rejected |
| Forward parent reference | Rejected |
| Circular parent relationship | Rejected |
| Duplicate version ID | Rejected |
| Application output version inconsistent with history | Rejected |
| Current effective version absent from history | Rejected |
| Required `export_timestamp` absent | Rejected |

The errors were raised by the specific contiguous-number, exact-parent, unique-ID, application-binding or current-pointer gates rather than by hiding the imported record.

## 6. Application and rollback protections

- Apply/preview eligibility is recalculated against the current controlled source and current Effective Clause immediately before computation.
- Target ID/number, operation, category, target basis, exact operands, target location and sequence are copied into an immutable application snapshot.
- An Applied log must be the unique creator of its output version.
- Rollback may address only a real Applied record for the same amendment and Effective Clause.
- A successful Rolled Back log must reproduce the reversed Applied log's immutable target/operation snapshot exactly.
- Failed Rollback attempts must identify the same amendment, Effective Clause and immutable target/operation snapshot as the Applied record they address.
- Only one successful rollback may reverse a given Applied record.
- The reversed Applied record's `rolled_back_at` and `rollback_available` fields must match the rollback event.
- Rollback restores by baseline-plus-active-log replay. It does not overwrite the record with an arbitrary old snapshot.
- Rollback and import both require the controlled baseline identity/text/heading/parent/order and both SHA-256 identities.
- Reapplication creates a new application ID and version. It does not overwrite or reuse historical Applied/Rolled Back records.

### Rollback/application adversarial results

| Invalid imported state | Result |
|---|---|
| Rollback without corresponding Applied record | Rejected |
| Rollback with wrong amendment | Rejected |
| Rollback with wrong Effective Clause | Rejected |
| Second successful rollback for the same Applied record | Rejected |
| Rollback restored/input version mismatch | Rejected |
| Fabricated Applied/Rolled Back pair | Rejected |
| Application output inconsistent with version history | Rejected |
| Rolled Back immutable snapshot differs from reversed Applied | Rejected |
| Failed Rollback cross-links another Effective Clause/snapshot | Rejected |
| Attempt type/result combination is inconsistent | Rejected |
| Non-causal rollback timestamp | Rejected |
| Version redline is fabricated | Rejected |
| Initial version contains an active amendment | Rejected |
| Unknown or ID-less change segment | Rejected |
| Duplicate or stale `failed_amendment_ids` | Rejected |
| Fabricated history row tries to override application status | Rejected |

### Valid Apply → Rollback → Reapply result

- Result: **PASS**.
- Version numbers: `0, 1, 2, 3`.
- Version events: `Baseline, Tombstone, Rollback, Tombstone`.
- Three committed application IDs were distinct.
- The first Applied record remained present, was marked rolled back, and was no longer rollback-available.
- Reapplication generated a new application ID and new version record.
- A separate two-amendment test applied sequence 1 then sequence 2, rolled back sequence 1, retained independently replayable sequence 2, and passed native round-trip validation with `Partially Applied` status.

## 7. Runtime Clause Spine integrity

- Runtime Effective Clause rendering reads only project-layer `effective_clauses` records accepted by the validation/integrity gates.
- No Effective record is inserted into `fidicSourceLayer`, `data/processed/fidic_2017_red_clauses.json` or any tracked baseline JSON.
- Deleted clauses remain records with empty current text, `is_tombstone=true` and `Deleted`/`Partially Applied` status as appropriate.
- A new clause number already occupied by the controlled baseline is rejected. Effective clause numbers and controlled baseline IDs must also be unique within imported project state.
- A browser test with one active deletion and a later pending same-clause amendment produced `Partially Applied`, retained the tombstone, and passed project self-validation.
- A safely failed unsupported operation created no new Effective Clause.
- The invalid-import atomic test left the valid live record unchanged, so no invalid Effective Clause was rendered.
- Baseline Clause 5 remains **Subcontracting**.
- Baseline Clause 12 remains **Measurement and Valuation**.

## 8. Tests run and results

| Test group | Result | Evidence |
|---|---|---|
| Modern JavaScript syntax | PASS | Node.js 24.19.0 parsed `app.js` and `pc_alignment_engine.js` |
| Pure functions | PASS | 25/25 checks in `scripts/test_pc_alignment_engine.js` |
| JSON parsing | PASS | 27/27 repository JSON files parsed with PowerShell `ConvertFrom-Json` |
| Schema — v1 project demo | PASS | Expected valid / actual valid |
| Schema — v1.1 project demo | PASS | Expected valid / actual valid |
| Schema — structured amendment input | PASS | Expected valid / actual valid |
| Schema — false PDF extraction fixture | PASS | Expected invalid / actual invalid |
| Schema — processed FIDIC source | PASS | Expected valid / actual valid |
| Browser regression | PASS | See section 9 |
| Browser console | PASS | 0 error-level entries after final reload and view traversal |
| Baseline immutability | PASS | See section 10 |
| Git diff check | PASS | `git diff --check` returned no whitespace errors |

The pure-function fixture is synthetic and reported `production_baseline_used=false`; production-source identity/loading and UI integration were tested separately in the browser.

## 9. Browser regression result

Final normal URL tested: `http://127.0.0.1:8000/?reload=20260818-pc-task3-13`.

- Functional Skeleton loaded all 7 contract systems.
- Baseline Clause Spine loaded 21 main clauses and 215 sub-clauses, with 21 directory buttons and source text available.
- Clause 5 displayed `Subcontracting`; Clause 12 displayed `Measurement and Valuation`.
- Tag View loaded 3 groups and 18 approved tags. Selecting `Claim for EOT` displayed clause identity, full source text with wording highlights, and `View in Clause Spine` links. Its desktop grid is 23% / 62% / 15%.
- Particular Conditions Review loaded all five Task 3 views: Overview, Source Intake, Amendment Register, Clause Alignment and Consolidation Workbench.
- Effective Clause Spine, Effective Functional Skeleton, Effective Tag View and Verification remained disabled as later work.
- The Preview / Unverified Baseline warning remained visible.
- Browser console error count: `0`.
- Layout check: document `scrollWidth=624`, `clientWidth=624`; no horizontal overflow at the tested viewport.
- No temporary acceptance-only DOM/API hook remained in the final page.

Additional browser acceptance scenarios passed:

- Exact machine match for the controlled Clause 5.1 identity.
- Machine `Number Match / Heading Difference` changed to `Human Confirmed` only after an explicit decision; the machine result remained in the audit record.
- Unsupported `Delete Paragraph` attempt failed with `UNSUPPORTED_OPERATION` and did not create an Effective Clause.
- Missing-current-version project import displayed `Failed Validation`, did not create pending import state and did not alter the live Workbench.
- A valid native Apply/Rollback/Reapply state and the valid early-sequence rollback/later-sequence-active state both passed native round-trip validation.

## 10. Baseline protection

### File and digest checks

- 15/15 tracked baseline/data files matched their `HEAD` Git blobs.
- `git diff --name-only -- data project-control` returned no tracked change.
- Processed source-layer file SHA-256: `d8777743ebcd4d833a7ff5b0f9da91f81f93820f3ff1d5e48e1b4aa0173368ec`.
- Corrected Word SHA-256: `6f3105d20dfd072af1a938b9a78d98f4f5e4ed00b794ce41167112352e75dc19`.
- Authoritative PDF SHA-256: `a44bd894956f7cc61eab49b51d6382af53cdc691da4f2ab20c59aa2c6b2b915e`.
- Immutable clause-record digest: `e98dd354f7b57284d47d6404b36ee35397c4a4f98a3bf933ae037b2da61639db`, matching the PDF-verification report before/after digest.
- Imported wording digest: `4754677398ed1e54165adea453e86f8a42661bbe9421a25dfd78c4fa7ebdc5ab`, matching the corrected-Word cross-check report before/after digest.
- Project-amendment/application marker fields found in the 215 processed baseline clause records: `0`.

Functional Skeleton, baseline Clause Spine and Tag View all loaded in the final browser regression. No project amendment was written to the baseline layer.

## 11. Task boundary

Task 3 did **not** implement:

- defined-term or global amendment application;
- Contract Data processing;
- automatic AI extraction from unstructured Particular Conditions;
- Effective Contract publication;
- Effective Functional Skeleton overlay;
- Effective Tag View overlay;
- final two-way verification;
- risk profiling, risk scoring or exposure scoring.

The corresponding data fields remain empty, null or `Not Assessed`, and later-work UI destinations remain disabled.

## 12. Known limitations

- The project is a static browser application. State lives in browser memory until exported; there is no server-side persistence, authentication, signature, concurrent-user control or durable audit service.
- The browser runs a strict native structural/semantic import gate, not a general JSON-Schema engine. Formal release-package Schema validation is therefore a separate `Test-Json` acceptance step; the UI says `Native validation passed`, not `Schema valid`.
- DOCX/PDF intake is registered honestly as `Requires Preprocessing`; there is no automatic extraction in Task 3.
- The FIDIC source is not fully PDF-verified: 27 sub-clauses are PDF-verified and 188 remain manual-review pending. All Effective records therefore remain Not Verified and publication-ineligible.
- Fuzzy candidates remain human-review evidence only. Human confirmation cannot make a non-unique literal target applicable.
- The unsupported operations listed in section 4 are retained for later work rather than approximated.
- Existing source-data limitation: 5.2, 13.3.1 and 13.3.2 are not independent processed records; two pre-existing tag-index rows point to `fidic_2017_red_5_2`. Task 3 did not alter that baseline/tag data.
- Task 4 views and overlays are intentionally absent.

## 13. Manual browser test steps

### Start

1. From `C:\Projects\construction-contract-baseline`, run `python -m http.server 8000`.
2. Open `http://127.0.0.1:8000/?reload=20260818-pc-task3-13`.
3. Select **Particular Conditions Review → Source Intake**.
4. Create a review project and choose `data/demo/pc_review_task3_intake_demo.txt`.
5. Continue to **Amendment Register**.

### Exact Match

1. Add a Clause-specific Amendment.
2. Set operation to `Delete Entire Sub-Clause`, parent to `5`, sequence to `1`, target number to `5.1`, target heading to `Subcontractors`, and target basis to `Original Baseline Text`.
3. Enter an exact synthetic PC instruction and save.
4. Confirm the Alignment Status is `Exact Match`.

### Human Confirmed alignment

1. Add another Clause-specific Amendment for target `5.2.1`, parent `5`, with a deliberately different target heading and a supported whole-clause operation.
2. Save and confirm the machine result is `Number Match / Heading Difference`.
3. Open **Clause Alignment** and select **Confirm Alignment**.
4. Confirm the effective status becomes `Human Confirmed` while the machine result remains visible in the evidence/audit record.

### Successful application

1. Open **Consolidation Workbench** and select the Exact Match entry.
2. Review the eligibility reasons and preview.
3. Select **Apply Amendment**.
4. Confirm a separate Effective Clause/version and Applied log are created, the deletion remains visible as a tombstone, and the FIDIC baseline view remains unchanged.

### Failed application

1. Add an entry for target `5.2.2`, parent `5`, with operation `Delete Paragraph`.
2. Complete the alignment review/confirmation and open it in the Workbench.
3. Attempt Apply.
4. Confirm `Not Yet Supported / Human Review Required`, a safe Failed audit entry, and no new Effective Clause.

### Rollback

1. In the Workbench application history, find the active Applied record.
2. Select **Roll Back**.
3. Confirm a new Rollback version and Rolled Back audit entry appear; the original Applied entry remains in history and is no longer rollback-available.

### Reapplication

1. Re-select the rolled-back amendment after alignment/eligibility is current.
2. Apply it again.
3. Confirm a new application ID and a new version are added; the earlier Applied and Rolled Back records remain unchanged.

### Deleted-clause tombstone

1. Use the state immediately after **Successful application**, or inspect the current active reapplication. Do not apply an already-active amendment again.
2. Confirm the Effective Clause record remains visible with empty current text and a `Deleted` tombstone status.
3. To repeat from scratch, roll back or reset first. Add a later pending amendment for the same clause, then apply the earlier deletion; confirm the tombstone remains and status becomes `Partially Applied`.

### Invalid project import

1. Export a valid review-project JSON.
2. In a copy, change `effective_clauses[0].current_version_id` to a nonexistent value (or duplicate a version ID).
3. Use **Re-import review project JSON**.
4. Confirm the UI reports `Failed Validation`, provides no Confirm Import action, and leaves the current Workbench project, versions and Effective Clauses unchanged.

### Valid export, formal Schema check and re-import

1. Export a valid review project after Apply/Rollback/Reapply.
2. Run `Test-Json -Json (Get-Content -Raw <export.json>) -SchemaFile data/schemas/pc_review_project_v1_1.schema.json` in PowerShell and confirm `True`.
3. Re-import the unchanged file and confirm the native validation summary appears before confirmation.
4. Load `data/demo/pc_review_project_demo.json` to confirm the v1.0 package is offered for in-memory v1.1 upgrade; export the upgraded state before using it as a Task 3 package.
5. Validate/import `data/demo/pc_structured_amendment_input_demo.json`; separately confirm `pc_structured_pdf_false_extraction_invalid_demo.json` is rejected for claiming unsupported PDF extraction.

## 14. Final confirmation

The Task 3 acceptance gate is complete. The baseline remains unchanged, the final browser regression passes, and Task 4 has not started.
