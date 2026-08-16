#!/usr/bin/env python3
"""Compare the local FIDIC Word source layer with the reference PDF.

Only clauses whose complete wording occurs in the PDF after conservative
layout normalisation are eligible for automatic PDF confirmation. Unmatched
records are never altered.
"""

from __future__ import annotations

import argparse
import json
import re
import unicodedata
from datetime import datetime, timezone
from pathlib import Path

from pypdf import PdfReader


TRANSLATION = str.maketrans(
    {
        "\u00a0": " ",
        "\u00ad": "",
        "\u2018": "'",
        "\u2019": "'",
        "\u201c": '"',
        "\u201d": '"',
        "\u2013": "-",
        "\u2014": "-",
        "\ufb00": "ff",
        "\ufb01": "fi",
        "\ufb02": "fl",
        "\ufb03": "ffi",
        "\ufb04": "ffl",
    }
)


def canonical_text(value: str) -> str:
    value = unicodedata.normalize("NFKC", value).translate(TRANSLATION)
    return re.sub(r"\s+", " ", value).strip()


def extract_pdf(pdf_path: Path) -> tuple[list[str], str]:
    reader = PdfReader(pdf_path)
    pages = [(page.extract_text() or "") for page in reader.pages]
    if not pages or any(not page.strip() for page in pages):
        raise RuntimeError("The reference PDF has missing or non-extractable pages.")
    return pages, canonical_text("\n".join(pages))


def compare(source: dict, pages: list[str], pdf_text: str) -> dict:
    matched: list[str] = []
    unmatched: list[str] = []
    ambiguous: list[str] = []
    page_hits: dict[str, list[int]] = {}
    canonical_pages = [canonical_text(page) for page in pages]

    for clause in source["clauses"]:
        clause_no = clause["clause_no"]
        wording = canonical_text(clause["full_text"])
        occurrence_count = pdf_text.count(wording) if wording else 0
        if occurrence_count == 1:
            matched.append(clause_no)
            page_hits[clause_no] = [
                number
                for number, page in enumerate(canonical_pages, start=1)
                if wording in page
            ]
        elif occurrence_count > 1:
            ambiguous.append(clause_no)
        else:
            unmatched.append(clause_no)

    return {
        "method": "complete-clause exact match after Unicode, quote, dash and whitespace normalisation",
        "pdf_page_count": len(pages),
        "matched_count": len(matched),
        "unmatched_count": len(unmatched),
        "ambiguous_count": len(ambiguous),
        "matched_clause_numbers": matched,
        "unmatched_clause_numbers": unmatched,
        "ambiguous_clause_numbers": ambiguous,
        "single_page_hits": page_hits,
    }


def apply_matches(source: dict, result: dict, pdf_path: Path) -> None:
    matched = set(result["matched_clause_numbers"])
    timestamp = datetime.now(timezone.utc).isoformat()
    for clause in source["clauses"]:
        if clause["clause_no"] not in matched:
            continue
        # The Word-preserved paragraph layout is retained because the PDF text
        # extractor introduces page headers and line-wrap artefacts. The full
        # wording has nevertheless matched the PDF conservatively and exactly.
        clause["source_text_origin"] = "PDF reference text matched to Word manual copy"
        clause["verification_status"] = "pdf_text_matched"
        clause["pdf_verification"] = {
            "reference_file": pdf_path.as_posix(),
            "method": result["method"],
            "verified_at_utc": timestamp,
            "page_hits": result["single_page_hits"].get(clause["clause_no"], []),
        }


def report_markdown(result: dict, pdf_path: Path, source_path: Path) -> str:
    unmatched = ", ".join(result["unmatched_clause_numbers"]) or "None"
    ambiguous = ", ".join(result["ambiguous_clause_numbers"]) or "None"
    return f"""# FIDIC 2017 Red PDF Comparison Report

## Scope

- Structured source: `{source_path.as_posix()}`
- PDF reference: `{pdf_path.as_posix()}`
- Method: {result['method']}.
- PDF pages with extractable text: **{result['pdf_page_count']}**

## Results

- Automatically matched clauses: **{result['matched_count']}**
- Unmatched clauses requiring review: **{result['unmatched_count']}**
- Ambiguous repeated matches: **{result['ambiguous_count']}**
- Unmatched clause numbers: {unmatched}
- Ambiguous clause numbers: {ambiguous}

## Control boundary

Only complete, unique matches are eligible for `pdf_text_matched`. Whitespace,
Unicode compatibility characters, typographic quotes, dashes and standard
ligatures are normalised. Words, numbers and other punctuation are not ignored.
Unmatched and ambiguous records are not changed. PDF extraction artefacts are
not written into clause wording; the matching Word paragraph layout is retained.
The result is a source-text comparison, not legal approval or confirmation that
the PDF is an authorised contract-use publication.
"""


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path)
    parser.add_argument("pdf", type=Path)
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--report", type=Path)
    args = parser.parse_args()

    source = json.loads(args.source.read_text(encoding="utf-8"))
    pages, pdf_text = extract_pdf(args.pdf)
    result = compare(source, pages, pdf_text)
    print(json.dumps({key: result[key] for key in (
        "pdf_page_count", "matched_count", "unmatched_count", "ambiguous_count",
        "unmatched_clause_numbers", "ambiguous_clause_numbers"
    )}, ensure_ascii=False, indent=2))

    if args.apply:
        apply_matches(source, result, args.pdf)
        args.source.write_text(
            json.dumps(source, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
        )
    if args.report:
        args.report.parent.mkdir(parents=True, exist_ok=True)
        args.report.write_text(
            report_markdown(result, args.pdf, args.source), encoding="utf-8"
        )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
