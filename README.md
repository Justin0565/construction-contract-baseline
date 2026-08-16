# Construction Contract Baseline

## What this prototype does

This is a static, browser-based model of the functional structure of the FIDIC 2017 Red Book and FIDIC 1999 Red Book. It helps a construction contract lawyer move from a high-level legal module to its sub-issues, elements, core legal effects, clause references and edition crosswalk.

The prototype is a structural research tool, not legal advice. It uses sample clause numbers, headings and short paraphrases only. It does not reproduce FIDIC clause wording.

## Opening the prototype

For live editing of the JSON data, open a terminal in the `construction-contract-baseline` folder and start a local server.

Mac/Linux:

```bash
python3 -m http.server 8000
```

Windows:

```powershell
py -m http.server 8000
```

Then open:

`http://localhost:8000`

Some browsers block separate JSON files when `index.html` is opened by double-clicking. The dashboard will still display its embedded fallback sample data, but changes made to the JSON files will only appear when the folder is served through a local server.

No installation, build step, framework, database or internet connection is required.

## How the data files work

All dashboard content is held in the `data` folder:

- `modules.json` — the seven top-level functional modules.
- `sub_issues.json` — legal sub-issues, linked to a module by `moduleId`.
- `elements.json` — the legal/functional elements, linked by `subIssueId`; each element also lists its permitted `tagIds`.
- `tags.json` — the controlled list of 14 Core Legal Effect Tags. Do not add tags without an express product decision.
- `fidic_2017_red_map.json` — sample 2017 Red Book clause references linked by `elementId`.
- `fidic_1999_red_map.json` — sample 1999 Red Book clause references linked by `elementId`.
- `crosswalk_2017_1999.json` — short structural comparison notes linked by `elementId`.

The IDs are the joins between files. For example, an element with `subIssueId: "time-delay"` appears under that sub-issue. A mapping row with the same `elementId` as the element appears in its clause table.

## Local FIDIC 2017 source import

The supplied legacy Word manual copy can be parsed into a local, structured source layer with:

```powershell
python scripts/import_fidic_word.py data/source/FIDIC_Red_2017/FIDIC_2017_Red_Book.doc `
  --output data/processed/fidic_2017_red_clauses.json `
  --report reports/FIDIC_2017_Red_Word_Import_Report.md
```

The generated full-text JSON is deliberately gitignored. Its records remain marked `needs_pdf_verification`; the importer does not use the PDF, add functional mappings, or alter source wording. The committed schema is at `data/processed/fidic_2017_red_clauses.schema.json`.

Run the conservative PDF comparison separately:

```powershell
python scripts/verify_fidic_pdf.py data/processed/fidic_2017_red_clauses.json `
  "data/source/FIDIC_Red_2017/Extracted GC-FIDI Red 2017.pdf" `
  --apply --report reports/FIDIC_2017_Red_PDF_Comparison_Report.md
```

Only complete, unique matches receive `pdf_text_matched`. The comparison keeps the cleaner Word paragraph layout and never changes unmatched records.

## How a lawyer can update the JSON

1. Make a backup copy of the file to be changed.
2. Open the JSON file in a plain-text editor.
3. Copy a nearby object (the content between `{` and `}`) as a pattern.
4. Give a new record a short, unique `id`. IDs should use lowercase words separated by hyphens.
5. Preserve commas between objects and keep all text inside double quotation marks.
6. Use an existing module, sub-issue, element or tag ID when making a link.
7. Refresh the browser to see the change.

For classifications in Scope & Interface, Time, and Payment / Price, use only:

- `Baseline` — the original contractual baseline, such as Works, Site, Time for Completion or Contract Price.
- `Adjustment` — a mechanism that changes that baseline, such as a Variation, EOT, remeasurement or cost adjustment.
- `Control Mechanism` — a procedural or legal control, such as notice, determination or certification.

For legal effects, use only IDs already present in `tags.json`. Adding a tag to `tags.json` alone is not enough; add its ID to the relevant element's `tagIds` list.

Use clause numbers, headings and concise original paraphrases. Do not copy clause wording from a FIDIC publication.

## Why 2017 Red is the functional master reference

The 2017 Red Book is used as the master structural reference because its contract administration, claims and dispute processes are more explicit and more systematically separated. This makes it a useful organising framework for a functional legal model. The choice does not imply that 2017 wording governs any individual project.

## Why 1999 Red is the market baseline

The 1999 Red Book remains a practical market baseline because it has been widely used, amended and incorporated into project contracts over a long period. Mapping 2017 functions back to 1999 supports recognition of familiar clause architecture and later comparison with market forms.

## Product boundary and future modules

This phase establishes structure, functional logic, labels, elements, legal effects and the 2017/1999 mapping. It deliberately does not interpret project-specific Particular Conditions.

Planned future subsystems are:

- Particular Conditions Amendment Parser
- Contract Review Engine
- Drafting Engine

These should consume the baseline model later; they should not be mixed into this prototype.
