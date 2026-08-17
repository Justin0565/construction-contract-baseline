# Scope & Works UI/Data Audit Report

Audit date: 2026-08-17  
Scope: Scope & Works only  
Methodology: Scope-Based Dashboard Standard v1.0; Clause Element Extraction Methodology v1.2; Tag Team Manual v1.0

## Files audited

- `project-control/00_PROJECT_RULES.md`
- `project-control/01_Dashboard_Classification_Methodology_Memo.md`
- `project-control/02_Scope_Final_Dashboard_Content_Matrix.md`
- `project-control/07_ELEMENT_METHODOLOGY_MANUAL.md`
- `project-control/08_TAG_DICTIONARY_AND_TAGGING_RULES.md`
- `project-control/09_SCOPE_BASED_DASHBOARD_STANDARD.md`
- `index.html`
- `styles.css`
- `app.js`
- `data/scope_works_v1.json`
- `data/clause_elements.json`
- `data/tag_clause_index.json`
- `data/processed/fidic_2017_red_clauses.json` (read-only source-layer comparison)

## Files modified

- `index.html` — application cache key only
- `app.js` — approved Tag View dictionary, source-record alias resolution and cross-view status
- `data/scope_works_v1.json` — active Scope tag dictionary/index migration and methodology metadata
- `data/clause_elements.json` — mechanical migration of deprecated Scope tag identifiers
- `data/tag_clause_index.json` — mechanical migration of deprecated Scope tag identifiers
- `reports/scope_ui_data_audit_report.md`
- `reports/scope_ui_data_audit_report.json`
- `reports/scope_ui_data_audit_summary.md`

`styles.css` was audited but not modified.

## Scope structure audit

All four approved practice categories are present and displayed:

1. Main Performance Obligations / 主要义务 — 4 performance nodes
2. Ancillary Management Obligations / 附带义务，即管理 — 6 performance nodes
3. Employer Enabling Obligations / 业主 / 对方使能义务 — 9 performance nodes
4. Scope Variables and Variations / 变量，即变更 — 9 performance nodes

Total performance nodes checked: **28**.  
Total node clause anchors checked: **129**.  
Unique Scope clause/tag anchors checked: **82**.

The UI is driven by practice categories and performance nodes, not FIDIC headings.

## Clause anchor audit

- Clickable range anchors found in the current Scope data: **0**
- Range anchors split during this audit: **0**
- Invalid combined clickable anchors remaining: **0**
- Repeated clause anchors across performance nodes: **28 clause numbers**; the runtime consolidates these into one clause mapping and records additional node paths as secondary/cross-link paths.
- Duplicate records in the final `clause_mappings` collection: **0**

The existing project-wide anchor normalisation remains active in `app.js` and rejects invalid anchor values.

## Clause link audit

Of 82 unique Scope anchors:

- **76** have an exact main-clause or sub-clause source record.
- **6** are headings/sub-identifiers whose source text is stored in an existing parent or child source record.
- **0** remain unresolved after source-record alias resolution.

Resolved aliases:

| Requested anchor | Displayed source record |
|---|---|
| 1.1.44 | 1.1 |
| 1.1.67 | 1.1 |
| 13.3.1 | 13.3 |
| 13.3.2 | 13.3 |
| 4.9 | 4.9.1 |
| 5.2 | 5.2.1 |

Broken/non-exact links fixed: **6**. The Clause Spine now opens the available containing source record, highlights it, scrolls it into view, displays full text and states the requested and resolved clause numbers. Missing text continues to use the explicit fallback status rather than a blank panel.

## Clause Spine label audit

- Clause 5: **Subcontracting** — correct
- Clause 12: **Measurement and Valuation** — correct

No label correction was required.

## Tag audit and migration

Deprecated active Scope tag applications found before migration:

- `Claim`: 10
- `EOT`: 10
- `Breach / Default`: 4

Mechanical alignment performed:

- 10 existing `Claim` applications migrated to `Claim for Cost` based on the existing approved monetary-claim mappings and retained `needs_lawyer_review` status.
- 9 existing `EOT` applications migrated to `Claim for EOT` based on the existing approved time-relief mappings and retained `needs_lawyer_review` status.
- Generic `EOT` was removed from 13.3.1; `Determination` remains the only active tag for that Scope mapping.
- `Breach / Default` for 11.2 was migrated to `Contractor Breach / Default` because the existing source wording expressly states “failure by the Contractor”.
- Deprecated `Breach / Default` was removed from 5.1, 5.2.2 and 13.1 because the active mapping did not objectively satisfy either party-specific definition. No replacement tag was inferred.
- Auxiliary Scope element/index data received 11 mechanical identifier migrations; one generic-EOT row for 13.3.1 was removed.

Deprecated active tags remaining in the active Scope UI/data: **0**.

The Tag View now presents all 18 approved dictionary names. Tags with no approved Scope mapping display an empty result rather than invented mappings.

## Element methodology audit

- Deprecated standalone `element_type` values found: **0**
- Deprecated standalone element types replaced: **0**
- Existing Scope elements are descriptive mechanism labels, not old taxonomy values.
- `data/scope_works_v1.json` now records Element Methodology v1.2 as the governing methodology.
- Clause-level element-type allocation was not invented. All 82 current Scope clause mappings remain `needs_lawyer_review` for any future element-level typing/QC work.

## Primary and secondary mapping audit

- Final Scope clause mappings: **82**
- Duplicate final clause mappings: **0**
- Each final mapping has one `primary_path` and a `secondary_paths` collection.
- Nine clauses whose genuine primary home is Contract Mechanics or Price & Payment remain represented in Scope only through explicit secondary/cross-link paths. These approved cross-functional relationships were not reinterpreted.
- Variation remains primarily under Scope & Works. Time, price and claim-procedure references remain secondary/cross-link paths where already recorded.

## Cross-view consistency audit

Issues found and corrected:

1. Tag View used deprecated tag names while Scope data used the old tag index.
2. 13.3.1 carried generic EOT contrary to the FIDIC 2017 Variation rule.
3. Six Scope anchors did not have an exact standalone source-layer record.
4. Tag View links and Functional Skeleton links needed the same source-record alias behaviour.

Browser verification confirmed:

- Functional Skeleton shows the four approved categories and all 28 nodes.
- No clickable range chips are rendered.
- Functional Skeleton 13.3.1 opens Clause Spine record 13.3 with full text and an explicit resolution notice.
- Tag View `Determination` lists 13.3.1 and displays the same containing source text.
- Tag View 13.3.1 opens the same Clause Spine record with origin `Tag View`.
- Clause 5 and Clause 12 labels are correct.
- No browser console errors were observed.

## Items left as needs_lawyer_review

- All **82** Scope clause mappings retain `needs_lawyer_review`.
- Clause-level allocation of descriptive elements to the three approved element types remains for lawyer review; no legal classification was invented.
- Removed unsupported party-specific Breach/Default candidates (5.1, 5.2.2 and 13.1) remain untagged unless approved after legal review.
- Existing cross-functional primary/secondary path judgments were preserved and remain subject to the recorded lawyer-review status.
- PDF review status remains separate and is displayed from the source-layer metadata.

## FIDIC source integrity

No FIDIC source wording, DOCX or PDF was altered.

Post-audit SHA-256 values:

- Processed corrected-Word source layer: `D8777743EBCD4D833A7FF5B0F9DA91F81F93820F3FF1D5E48E1B4AA0173368EC`
- Corrected Word document: `6F3105D20DFD072AF1A938B9A78D98F4F5E4ED00B794CE41167112352E75DC19`
- PDF reference: `A44BD894956F7CC61EAB49B51D6382AF53CDC691DA4F2AB20C59AA2C6B2B915E`

The processed source-layer hash is unchanged from the pre-update audit check.
