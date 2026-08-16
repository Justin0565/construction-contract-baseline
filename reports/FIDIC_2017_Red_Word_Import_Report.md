# FIDIC 2017 Red Word Import Report

## Import scope

- Input file used: `data/source/FIDIC_Red_2017/FIDIC_2017_Red_Book.doc`
- Extraction method: read-only OLE Compound Binary File and Word piece-table parsing, followed by two-cell Word table row parsing.
- Source used for wording: supplied Word manual copy only.
- PDF verification source used: **No**.
- Source SHA-256: `b9b05cdccd2658a0b65b7aa1da178663fb1ec01603f4f6b4666c1fc1a883b261`

## Record totals

- Main clauses imported: **21**
- Sub-clauses imported: **213**

| Main clause | Imported sub-clause records |
| --- | ---: |
| 1 | 16 |
| 2 | 6 |
| 3 | 8 |
| 4 | 35 |
| 5 | 4 |
| 6 | 12 |
| 7 | 8 |
| 8 | 13 |
| 9 | 4 |
| 10 | 4 |
| 11 | 11 |
| 12 | 4 |
| 13 | 7 |
| 14 | 23 |
| 15 | 11 |
| 16 | 6 |
| 17 | 6 |
| 18 | 6 |
| 19 | 8 |
| 20 | 9 |
| 21 | 12 |

## Numbering and structure checks

- Main clause sequence: `1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21`
- Duplicate sub-clause numbers: None.
- Parent-clause mismatches: None.
- Missing clause numbers: 0
- Missing titles: None.
- Empty full-text records: None.

## Source and parsing observations

- Suspected spelling or character issues preserved from the Word manual copy: `Certifcate` (90), `Specifcation` (72), `Proft` (23), `identifed` (17), `frst` (14), `certifcate` (14), `proft` (9), `fnancial` (6), `fuent` (6), `identifcation` (4), `confdential` (4), `modifed` (3), `specifcation` (3), `confdentiality` (3), `Confdentiality` (1), `folowing` (1), `compriseasole` (1), `Partiesfai` (1), `thedate` (1), `ofthe` (1), `wrting` (1)
- Records marked `needs_review`: None.
- Paragraph boundaries: Word paragraph marks were retained as line breaks; blank paragraph separation remains in `full_text`, and non-empty paragraphs are also stored in ordered `paragraphs` arrays.
- Uncertain or unparsed source rows:
- Source row 49 has 1 cells; expected 2.
- Source row 50 has 3 cells; expected 2.
- Source row 74 has 1 cells; expected 2.
- Source row 75 has 3 cells; expected 2.
- The importer did not silently correct titles, numbering, punctuation, spelling, spacing or Word-source wording.

## Data controls

- Every imported record uses `source_status: source_text_loaded`.
- Every imported record uses `verification_status: needs_pdf_verification`.
- No record is marked PDF verified, final verified or lawyer approved.
- `functional_mappings`, `tags` and `clause_elements` remain empty for every imported record.
- Literal clause references were captured from the Word-derived text only.
- Complete wording is stored once in the local processed source layer and is not embedded in `app.js` or other UI configuration.

## Files created

- `data/processed/fidic_2017_red_clauses.json` (local full-text output; gitignored)
- `data/processed/fidic_2017_red_clauses.schema.json`
- `scripts/import_fidic_word.py`
- `reports/FIDIC_2017_Red_Word_Import_Report.md`

## Verification boundary

The PDF was not opened, parsed or used to fill any gap. No legal-effect tags, functional mappings or clause elements were added during this import.
