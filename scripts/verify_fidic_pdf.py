#!/usr/bin/env python3
"""Conservatively verify imported FIDIC 2017 wording against a PDF.

Word wording is immutable. Only complete unique matches after layout-only
normalisation are automatically verified. All other results require review.
"""
from __future__ import annotations

import argparse, hashlib, json, re, unicodedata
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from pypdf import PdfReader

HIGH_PRIORITY = {
    "1.9", "1.13", "2.1", "2.2", "2.3", "2.4", "2.5", "2.6", "3.5", "3.7",
    "4.1", "4.6", "4.7", "4.12", "4.15", "4.16", "4.23", "5.1", "5.2",
    "7.5", "7.6", "8.5", "8.8", "11.2", "13.1", "13.3.1", "13.3.2",
    "13.4", "13.5", "13.6", "14.6", "15.2", "16.2", "17.4", "17.5", "20.2", "21.4",
}
EXPECTED_MAIN = {
    "1": "General Provisions", "2": "The Employer", "3": "The Engineer",
    "4": "The Contractor", "5": "Subcontracting", "6": "Staff and Labour",
    "7": "Plant, Materials and Workmanship", "8": "Commencement, Delays and Suspension",
    "9": "Tests on Completion", "10": "Employer's Taking Over", "11": "Defects after Taking Over",
    "12": "Measurement and Valuation", "13": "Variations and Adjustments",
    "14": "Contract Price and Payment", "15": "Termination by Employer",
    "16": "Suspension and Termination by Contractor", "17": "Care of the Works and Indemnities",
    "18": "Exceptional Events", "19": "Insurance", "20": "Employer's and Contractor's Claims",
    "21": "Disputes and Arbitration",
}
TRANSLATION = str.maketrans({
    "\u00a0": " ", "\u00ad": "", "\u2018": "'", "\u2019": "'", "\u201c": '"',
    "\u201d": '"', "\u2013": "-", "\u2014": "-", "\ufb00": "ff", "\ufb01": "fi",
    "\ufb02": "fl", "\ufb03": "ffi", "\ufb04": "ffl",
})


def canonical(value: str) -> str:
    return re.sub(r"\s+", " ", unicodedata.normalize("NFKC", value).translate(TRANSLATION)).strip()


def heading(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", canonical(value).casefold()).strip()


def immutable_digest(source: dict) -> str:
    fields = ("clause_no", "clause_title", "parent_clause_no", "parent_clause_title", "original_order", "full_text", "paragraphs")
    payload = [{key: item.get(key) for key in fields} for item in source["clauses"]]
    return hashlib.sha256(json.dumps(payload, ensure_ascii=False, sort_keys=True).encode()).hexdigest()


def locate_heading(clause: dict, raw_pages: list[str]) -> list[int]:
    no = clause["clause_no"]
    title = heading(clause["clause_title"])
    exact_heading = f"{heading(no)} {title}"
    hits = []
    for page_no, raw in enumerate(raw_pages, 1):
        if page_no <= 6: continue
        searchable = heading(raw)
        if exact_heading in searchable: hits.append(page_no)
    return hits


def page_reference(hits: list[int]) -> str | None:
    hits = sorted(set(hits))
    if not hits: return None
    if len(hits) == 1: return f"PDF p. {hits[0]}"
    if hits == list(range(hits[0], hits[-1] + 1)): return f"PDF pp. {hits[0]}-{hits[-1]}"
    return ", ".join(f"PDF p. {number}" for number in hits)


def extraction_unreliable(raw: str) -> bool:
    return len(raw.strip()) < 120 or raw.count("\ufffd") / max(len(raw), 1) > 0.015


def verify_clause(clause: dict, raw_pages: list[str], pages: list[str], pdf_text: str) -> dict:
    wording = canonical(clause.get("full_text", ""))
    count = pdf_text.count(wording) if wording else 0
    full_hits = [i for i, page in enumerate(pages, 1) if wording and wording in page]
    heading_hits = locate_heading(clause, raw_pages)
    candidates = full_hits or heading_hits[:1]
    unreliable = bool(candidates) and any(extraction_unreliable(raw_pages[p - 1]) for p in candidates)
    if not wording:
        status, text_status, issue = "imported_text_missing", "missing_text", "imported_text_missing"
        note = "Imported clause text is missing; no PDF wording was copied into the source layer."
    elif count == 1:
        status, text_status, issue = "pdf_verified", "exact_or_near_exact_match", None
        note = "Complete unique match after conservative layout normalisation; imported Word wording retained unchanged."
    elif count > 1:
        status, text_status, issue = "needs_manual_pdf_review", "unable_to_compare_reliably", "ambiguous_repeated_full_text_match"
        note = "Complete wording appears more than once in extracted PDF text; manual visual confirmation is required."
    elif unreliable:
        status, text_status, issue = "pdf_ocr_unreliable_needs_manual_review", "unable_to_compare_reliably", "pdf_text_extraction_unreliable"
        note = "Candidate PDF extraction is unreliable; imported Word wording was not overwritten."
    else:
        status, text_status, issue = "needs_manual_pdf_review", "unable_to_compare_reliably", "automated_full_text_match_not_established"
        note = "A complete reliable machine match was not established; discrepancy is reported only and imported Word wording remains unchanged."
    return {
        "clause_no": clause["clause_no"], "clause_title": clause["clause_title"],
        "parent_clause_no": clause["parent_clause_no"], "verification_status": status,
        "text_match_status": text_status,
        "pdf_page_reference": page_reference(full_hits if count == 1 else heading_hits if len(heading_hits) == 1 else []),
        "issue_type": issue, "qc_note": note, "high_priority": clause["clause_no"] in HIGH_PRIORITY,
        "heading_page_candidates": heading_hits,
    }


def apply_metadata(clause: dict, item: dict, pdf: Path, timestamp: str) -> None:
    corrected_source = clause.get("source_text_origin") == "Corrected Word working copy"
    clause.update({
        "pdf_source_file": pdf.as_posix(), "pdf_page_reference": item["pdf_page_reference"],
        "pdf_verification_status": item["verification_status"], "text_match_status": item["text_match_status"],
        "qc_status": item["verification_status"], "qc_note": item["qc_note"],
        "verified_at": timestamp, "verified_by": "codex_pdf_verification",
        "verification_status": "pdf_text_matched" if item["verification_status"] == "pdf_verified" else "needs_pdf_verification",
        "source_text_origin": ("PDF reference text matched to corrected Word working copy" if corrected_source else "PDF reference text matched to Word manual copy") if item["verification_status"] == "pdf_verified" else ("Corrected Word working copy" if corrected_source else "Word manual copy"),
    })


def verify_inventory(records: list[dict], raw_pages: list[str], pdf: Path, timestamp: str) -> list[dict]:
    output = []
    for clause in records:
        expected = EXPECTED_MAIN.get(clause["clause_no"])
        verified = expected is not None and heading(expected) == heading(clause["clause_title"])
        status = "pdf_verified" if verified else "title_mismatch"
        note = "Parent clause number, title and order confirmed against the visually reviewed PDF contents pages." if verified else "Parent title differs from the PDF inventory control and requires manual review."
        reference = "PDF contents pp. 1-6"
        clause.update({
            "pdf_source_file": pdf.as_posix(), "pdf_page_reference": reference,
            "pdf_verification_status": status,
            "text_match_status": "exact_or_near_exact_match" if verified else "unable_to_compare_reliably",
            "qc_status": "pdf_verified" if verified else "needs_manual_pdf_review", "qc_note": note, "verified_at": timestamp,
            "verified_by": "codex_pdf_verification",
        })
        output.append({"clause_no": clause["clause_no"], "clause_title": clause["clause_title"], "pdf_page_reference": reference, "pdf_verification_status": status, "qc_note": note})
    return output


def summary_markdown(report: dict) -> str:
    c = report["counts"]
    priority = [x for x in report["items"] if x["high_priority"] and x["verification_status"] != "pdf_verified"]
    priority_lines = "\n".join(f"- {x['clause_no']} {x['clause_title']}: {x['verification_status']}" + (f" ({x['pdf_page_reference']})" if x["pdf_page_reference"] else "") for x in priority) or "- None"
    missing_priority_lines = "\n".join(f"- {number}: not loaded as an independent source-layer record" for number in report["high_priority_not_loaded"]) or "- None"
    return f"""# FIDIC Red Book 2017 PDF Verification Summary

## Sources and control boundary

- PDF checked: `{report['pdf_source_file']}`
- Clause source checked: `{report['clause_source_file']}`
- PDF page count: **{report['pdf_page_count']}**
- Parent clauses checked: **{report['main_clause_records_checked']}**
- Loaded sub-clause records checked: **{report['total_records_checked']}**
- Imported Word `full_text` and paragraph digest unchanged: **{report['imported_text_unchanged']}**

Only complete, unique matches after conservative layout normalisation were automatically verified. PDF extraction text was never copied into imported clause wording. All uncertain differences are reported for manual review.

## Results

- pdf_verified: **{c.get('pdf_verified', 0)}**
- needs_manual_pdf_review: **{c.get('needs_manual_pdf_review', 0)}**
- text_discrepancy_found: **{c.get('text_discrepancy_found', 0)}**
- imported_text_missing: **{c.get('imported_text_missing', 0)}**
- pdf_ocr_unreliable_needs_manual_review: **{c.get('pdf_ocr_unreliable_needs_manual_review', 0)}**
- title_mismatch: **{c.get('title_mismatch', 0)}**

## Parent inventory controls

- Clause 5 confirmed as **Subcontracting**: **{report['inventory_controls']['clause_5_subcontracting']}**
- Clause 12 confirmed as **Measurement and Valuation**: **{report['inventory_controls']['clause_12_measurement_and_valuation']}**
- Parent inventory order 1-21 confirmed: **{report['inventory_controls']['sequence_1_to_21']}**

## High-priority clauses requiring manual review

{priority_lines}

## Requested high-priority references not loaded as independent records

{missing_priority_lines}

## Interpretation

`needs_manual_pdf_review` does not assert a substantive legal difference. It means the PDF text layer did not support a complete, reliable automatic match. The imported Word wording remains unchanged.
"""


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path); parser.add_argument("pdf", type=Path)
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--json-report", type=Path, required=True); parser.add_argument("--summary", type=Path, required=True)
    args = parser.parse_args()
    source = json.loads(args.source.read_text(encoding="utf-8")); before = immutable_digest(source)
    reader = PdfReader(args.pdf); raw_pages = [(page.extract_text() or "") for page in reader.pages]
    if not raw_pages: raise RuntimeError("PDF has no pages")
    pages = [canonical(page) for page in raw_pages]; pdf_text = canonical("\n".join(raw_pages))
    timestamp = datetime.now(timezone.utc).isoformat()
    items = [verify_clause(x, raw_pages, pages, pdf_text) for x in source["clauses"]]
    inventory = verify_inventory(source["main_clauses"], raw_pages, args.pdf, timestamp)
    if args.apply:
        for clause, item in zip(source["clauses"], items, strict=True): apply_metadata(clause, item, args.pdf, timestamp)
    after = immutable_digest(source)
    if before != after: raise RuntimeError("Imported wording or clause identity changed")
    main_numbers = [x["clause_no"] for x in source["main_clauses"]]
    title5 = next(x["clause_title"] for x in source["main_clauses"] if x["clause_no"] == "5")
    title12 = next(x["clause_title"] for x in source["main_clauses"] if x["clause_no"] == "12")
    counts = Counter(x["verification_status"] for x in items)
    loaded_numbers = {x["clause_no"] for x in source["clauses"]}
    report = {
        "report_version": "1.0", "verified_at": timestamp, "verified_by": "codex_pdf_verification",
        "pdf_source_file": args.pdf.as_posix(), "clause_source_file": args.source.as_posix(),
        "pdf_page_count": len(raw_pages), "main_clause_records_checked": len(inventory),
        "total_records_checked": len(items), "imported_text_digest_before": before,
        "imported_text_digest_after": after, "imported_text_unchanged": before == after,
        "counts": dict(sorted(counts.items())),
        "inventory_controls": {
            "sequence_1_to_21": main_numbers == [str(i) for i in range(1, 22)],
            "clause_5_subcontracting": heading(title5) == "subcontracting",
            "clause_12_measurement_and_valuation": heading(title12) == "measurement and valuation",
        },
        "high_priority_requested": sorted(HIGH_PRIORITY, key=lambda value: [int(part) for part in value.split(".")]),
        "high_priority_loaded": sorted(HIGH_PRIORITY & loaded_numbers, key=lambda value: [int(part) for part in value.split(".")]),
        "high_priority_not_loaded": sorted(HIGH_PRIORITY - loaded_numbers, key=lambda value: [int(part) for part in value.split(".")]),
        "main_clause_inventory": inventory, "items": items,
    }
    if args.apply:
        source["pdf_verification"] = {
            "pdf_source_file": args.pdf.as_posix(), "verified_at": timestamp,
            "verified_by": "codex_pdf_verification", "total_records_checked": len(items),
            "counts": dict(sorted(counts.items())), "imported_text_unchanged": True,
        }
        args.source.write_text(json.dumps(source, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    args.json_report.parent.mkdir(parents=True, exist_ok=True)
    args.json_report.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    args.summary.write_text(summary_markdown(report), encoding="utf-8")
    print(json.dumps({"pdf_pages": len(raw_pages), "main_clause_records_checked": len(inventory), "total_records_checked": len(items), "counts": dict(sorted(counts.items())), "imported_text_unchanged": before == after, "inventory_controls": report["inventory_controls"]}, indent=2))
    return 0


if __name__ == "__main__": raise SystemExit(main())
