#!/usr/bin/env python3
"""Extract the supplied legacy Word .doc into the local FIDIC source layer.

The importer is intentionally dependency-free. It reads the OLE compound file,
decodes the Word piece table, preserves paragraph order, and never consults the
PDF verification source. Full-text output is local-only and gitignored.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import struct
import sys
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable


FREESECT = 0xFFFFFFFF
ENDOFCHAIN = 0xFFFFFFFE
FATSECT = 0xFFFFFFFD
DIFSECT = 0xFFFFFFFC
REGULAR_SECTOR_MAX = 0xFFFFFFFA


class ExtractionError(RuntimeError):
    """Raised when the supplied Word binary cannot be parsed safely."""


class CompoundFile:
    """Minimal read-only Compound Binary File reader for legacy Word files."""

    def __init__(self, path: Path) -> None:
        self.path = path
        self.data = path.read_bytes()
        if self.data[:8] != bytes.fromhex("D0CF11E0A1B11AE1"):
            raise ExtractionError("Input is not an OLE Compound Binary File.")

        self.sector_size = 1 << self._u16(0x1E)
        self.mini_sector_size = 1 << self._u16(0x20)
        self.first_directory_sector = self._u32(0x30)
        self.mini_stream_cutoff = self._u32(0x38)
        self.first_minifat_sector = self._u32(0x3C)
        self.minifat_sector_count = self._u32(0x40)
        self.first_difat_sector = self._u32(0x44)
        self.difat_sector_count = self._u32(0x48)

        self.fat = self._load_fat()
        self.directory = self._load_directory()
        self.root = next(
            (entry for entry in self.directory.values() if entry["type"] == 5),
            None,
        )
        if not self.root:
            raise ExtractionError("OLE root directory entry is missing.")
        self.mini_stream = self._read_normal_stream(
            self.root["start_sector"], self.root["size"]
        )
        self.minifat = self._load_minifat()

    def _u16(self, offset: int) -> int:
        return struct.unpack_from("<H", self.data, offset)[0]

    def _u32(self, offset: int) -> int:
        return struct.unpack_from("<I", self.data, offset)[0]

    def _sector(self, sector_id: int) -> bytes:
        start = (sector_id + 1) * self.sector_size
        end = start + self.sector_size
        if start < self.sector_size or start >= len(self.data):
            raise ExtractionError(f"Invalid OLE sector reference: {sector_id}")
        return self.data[start:end].ljust(self.sector_size, b"\x00")

    @staticmethod
    def _is_regular_sector(sector_id: int) -> bool:
        return 0 <= sector_id < REGULAR_SECTOR_MAX

    def _load_fat(self) -> list[int]:
        difat = list(struct.unpack_from("<109I", self.data, 0x4C))
        fat_sector_ids = [sid for sid in difat if self._is_regular_sector(sid)]

        next_difat = self.first_difat_sector
        entries_per_difat_sector = self.sector_size // 4 - 1
        for _ in range(self.difat_sector_count):
            if not self._is_regular_sector(next_difat):
                break
            sector = self._sector(next_difat)
            values = struct.unpack(
                f"<{entries_per_difat_sector + 1}I", sector
            )
            fat_sector_ids.extend(
                sid for sid in values[:-1] if self._is_regular_sector(sid)
            )
            next_difat = values[-1]

        fat: list[int] = []
        entries_per_fat_sector = self.sector_size // 4
        for sector_id in fat_sector_ids:
            fat.extend(
                struct.unpack(
                    f"<{entries_per_fat_sector}I", self._sector(sector_id)
                )
            )
        if not fat:
            raise ExtractionError("OLE FAT could not be loaded.")
        return fat

    def _chain(self, start_sector: int, allocation_table: list[int]) -> list[int]:
        if not self._is_regular_sector(start_sector):
            return []
        chain: list[int] = []
        seen: set[int] = set()
        sector_id = start_sector
        while self._is_regular_sector(sector_id):
            if sector_id in seen:
                raise ExtractionError("OLE sector chain contains a cycle.")
            if sector_id >= len(allocation_table):
                raise ExtractionError("OLE sector chain points outside allocation table.")
            seen.add(sector_id)
            chain.append(sector_id)
            sector_id = allocation_table[sector_id]
        if sector_id not in (ENDOFCHAIN, FREESECT):
            raise ExtractionError(f"Unexpected OLE chain terminator: {sector_id:#x}")
        return chain

    def _read_normal_stream(self, start_sector: int, size: int) -> bytes:
        if size <= 0:
            return b""
        stream = b"".join(
            self._sector(sector_id)
            for sector_id in self._chain(start_sector, self.fat)
        )
        return stream[:size]

    def _load_directory(self) -> dict[str, dict[str, Any]]:
        raw = b"".join(
            self._sector(sector_id)
            for sector_id in self._chain(self.first_directory_sector, self.fat)
        )
        directory: dict[str, dict[str, Any]] = {}
        for offset in range(0, len(raw), 128):
            entry = raw[offset : offset + 128]
            if len(entry) < 128:
                break
            name_length = struct.unpack_from("<H", entry, 64)[0]
            object_type = entry[66]
            if name_length < 2 or object_type == 0:
                continue
            name = entry[: name_length - 2].decode("utf-16le", errors="replace")
            start_sector = struct.unpack_from("<I", entry, 116)[0]
            size = struct.unpack_from("<Q", entry, 120)[0]
            directory[name] = {
                "name": name,
                "type": object_type,
                "start_sector": start_sector,
                "size": size,
            }
        return directory

    def _load_minifat(self) -> list[int]:
        if not self._is_regular_sector(self.first_minifat_sector):
            return []
        raw = b"".join(
            self._sector(sector_id)
            for sector_id in self._chain(self.first_minifat_sector, self.fat)
        )
        if self.minifat_sector_count:
            raw = raw[: self.minifat_sector_count * self.sector_size]
        count = len(raw) // 4
        return list(struct.unpack(f"<{count}I", raw[: count * 4]))

    def read_stream(self, name: str) -> bytes:
        entry = self.directory.get(name)
        if not entry:
            raise ExtractionError(f"Required OLE stream is missing: {name}")
        size = int(entry["size"])
        start_sector = int(entry["start_sector"])
        if size < self.mini_stream_cutoff and self.minifat:
            chunks: list[bytes] = []
            for mini_sector_id in self._chain(start_sector, self.minifat):
                start = mini_sector_id * self.mini_sector_size
                chunks.append(self.mini_stream[start : start + self.mini_sector_size])
            return b"".join(chunks)[:size]
        return self._read_normal_stream(start_sector, size)


class WordBinaryDocument:
    """Read the main text story from a Word 97-2003 binary document."""

    def __init__(self, path: Path) -> None:
        self.compound = CompoundFile(path)
        self.word = self.compound.read_stream("WordDocument")
        if len(self.word) < 0x1AA:
            raise ExtractionError("WordDocument stream is unexpectedly short.")

    @staticmethod
    def _u16(data: bytes, offset: int) -> int:
        return struct.unpack_from("<H", data, offset)[0]

    @staticmethod
    def _u32(data: bytes, offset: int) -> int:
        return struct.unpack_from("<I", data, offset)[0]

    def _fib_positions(self) -> tuple[int, int, int]:
        position = 32
        csw = self._u16(self.word, position)
        position += 2 + csw * 2
        cslw = self._u16(self.word, position)
        fib_rg_lw_start = position + 2
        position = fib_rg_lw_start + cslw * 4
        pair_count = self._u16(self.word, position)
        pair_start = position + 2
        return fib_rg_lw_start, pair_count, pair_start

    def extract_main_text(self) -> str:
        flags = self._u16(self.word, 0x0A)
        table_stream_name = "1Table" if flags & 0x0200 else "0Table"
        table = self.compound.read_stream(table_stream_name)
        fib_rg_lw_start, pair_count, pair_start = self._fib_positions()
        if pair_count <= 33:
            raise ExtractionError("Word FIB does not contain an fcClx entry.")

        ccp_text = self._u32(self.word, fib_rg_lw_start + 3 * 4)
        fc_clx = self._u32(self.word, pair_start + 33 * 8)
        lcb_clx = self._u32(self.word, pair_start + 33 * 8 + 4)
        if not lcb_clx or fc_clx + lcb_clx > len(table):
            raise ExtractionError("Word piece-table location is invalid.")

        clx = table[fc_clx : fc_clx + lcb_clx]
        position = 0
        while position < len(clx) and clx[position] == 0x01:
            if position + 3 > len(clx):
                raise ExtractionError("Truncated Word grpprl record.")
            byte_count = self._u16(clx, position + 1)
            position += 3 + byte_count
        if position + 5 > len(clx) or clx[position] != 0x02:
            raise ExtractionError("Word piece table (Pcdt) was not found.")

        plc_size = self._u32(clx, position + 1)
        plc = clx[position + 5 : position + 5 + plc_size]
        if len(plc) != plc_size or plc_size < 16 or (plc_size - 4) % 12:
            raise ExtractionError("Word piece table has an invalid size.")

        piece_count = (plc_size - 4) // 12
        character_positions = list(
            struct.unpack_from(f"<{piece_count + 1}I", plc, 0)
        )
        descriptor_start = (piece_count + 1) * 4
        pieces: list[str] = []

        for index in range(piece_count):
            cp_start = character_positions[index]
            cp_end = character_positions[index + 1]
            if cp_start >= ccp_text:
                break
            character_count = min(cp_end, ccp_text) - cp_start
            if character_count <= 0:
                continue
            descriptor = descriptor_start + index * 8
            encoded_fc = self._u32(plc, descriptor + 2)
            compressed = bool(encoded_fc & 0x40000000)
            file_offset = encoded_fc & 0x3FFFFFFF
            if compressed:
                file_offset //= 2
                raw = self.word[file_offset : file_offset + character_count]
                text = raw.decode("cp1252", errors="replace")
            else:
                raw = self.word[
                    file_offset : file_offset + character_count * 2
                ]
                text = raw.decode("utf-16le", errors="replace")
            pieces.append(text)

        text = "".join(pieces)
        if len(text) < ccp_text * 0.95:
            raise ExtractionError(
                f"Extracted main story is unexpectedly short ({len(text)} of {ccp_text} characters)."
            )
        return text[:ccp_text]


def displayed_text(text: str, preserve_cells: bool = False) -> str:
    """Return visible Word field results while removing field instructions."""

    root: list[str] = []
    stack: list[dict[str, Any]] = []

    def append(value: str) -> None:
        if stack:
            stack[-1]["result" if stack[-1]["has_separator"] else "instruction"].append(value)
        else:
            root.append(value)

    for character in text:
        code = ord(character)
        if code == 0x13:
            stack.append({"instruction": [], "result": [], "has_separator": False})
        elif code == 0x14 and stack:
            stack[-1]["has_separator"] = True
        elif code == 0x15 and stack:
            field = stack.pop()
            append("".join(field["result"]) if field["has_separator"] else "")
        elif character == "\x0b":
            append("\n")
        elif character == "\x0c":
            append("\n")
        elif character == "\x07":
            append("\x07" if preserve_cells else "\t")
        elif character == "\xa0":
            append(" ")
        elif code >= 0x20 or character in ("\r", "\t"):
            append(character)

    while stack:
        field = stack.pop()
        append("".join(field["result"]) if field["has_separator"] else "")
    return "".join(root)


def paragraphs_from_word_text(text: str) -> list[str]:
    visible = displayed_text(text)
    paragraphs: list[str] = []
    for paragraph in visible.split("\r"):
        cleaned = paragraph.replace("\x00", "").rstrip()
        if cleaned.strip():
            paragraphs.append(cleaned)
    return paragraphs


MAIN_CLAUSE_PATTERN = re.compile(r"^\s*Clause\s+(\d+)\s*$", re.IGNORECASE)
SUBCLAUSE_PATTERN = re.compile(r"^\s*(\d+(?:\.\d+)+)\s*(.*)$", re.DOTALL)
SUBPARAGRAPH_PATTERN = re.compile(r"^\s*(\([A-Za-zivxlcdmIVXLCDM]+\))")
REFERENCE_BLOCK_PATTERN = re.compile(
    r"\b(?:Sub-)?Clauses?\s+"
    r"(\d+(?:\.\d+)*(?:\s*(?:,|and|or|to|–|-)\s*\d+(?:\.\d+)*)*)",
    re.IGNORECASE,
)
BRACKET_REFERENCE_PATTERN = re.compile(r"\b(\d+(?:\.\d+)+)\s*\[")
SUSPICIOUS_SOURCE_TERMS = re.compile(
    r"\b(?:certifcate|specifcation|confdential|confdentiality|identifcation|"
    r"identifed|proft|fnancial|frst|fuent|modifed|folowing|wrting|"
    r"thedate|ofthe|partiesfai|compriseasole)\b",
    re.IGNORECASE,
)
INCOMPLETE_END_PATTERN = re.compile(
    r"\b(?:a|an|and|in|is|it|of|or|the|to)\s*$", re.IGNORECASE
)


def normalized_cell_text(text: str) -> str:
    return displayed_text(text).replace("\x00", "").strip("\r\n\t ")


def normalized_title(text: str) -> str:
    return re.sub(r"\s+", " ", text.replace("\r", " ")).strip()


def normalized_full_text(text: str) -> str:
    visible = displayed_text(text).replace("\x00", "")
    lines = [line.rstrip() for line in visible.split("\r")]
    while lines and not lines[0].strip():
        lines.pop(0)
    while lines and not lines[-1].strip():
        lines.pop()
    return "\n".join(lines)


def paragraph_records(full_text: str) -> list[dict[str, Any]]:
    records: list[dict[str, Any]] = []
    for line in full_text.split("\n"):
        if not line.strip():
            continue
        label_match = SUBPARAGRAPH_PATTERN.match(line)
        records.append(
            {
                "order": len(records),
                "label": label_match.group(1) if label_match else None,
                "text": line,
            }
        )
    return records


def literal_cross_references(full_text: str) -> list[str]:
    found: list[tuple[int, str]] = []
    for match in REFERENCE_BLOCK_PATTERN.finditer(full_text):
        for number_match in re.finditer(r"\d+(?:\.\d+)*", match.group(1)):
            found.append((match.start(1) + number_match.start(), number_match.group(0)))
    for match in BRACKET_REFERENCE_PATTERN.finditer(full_text):
        found.append((match.start(1), match.group(1)))
    unique: list[str] = []
    seen: set[str] = set()
    for _, number in sorted(found, key=lambda item: item[0]):
        if number not in seen:
            seen.add(number)
            unique.append(number)
    return unique


def make_clause_id(clause_no: str) -> str:
    return f"fidic_2017_red_{clause_no.replace('.', '_')}"


def parse_word_table(raw_text: str) -> tuple[list[dict[str, Any]], list[dict[str, Any]], dict[str, Any]]:
    visible = displayed_text(raw_text, preserve_cells=True)
    source_rows = visible.split("\x07\x07")
    main_clauses: list[dict[str, Any]] = []
    clauses: list[dict[str, Any]] = []
    row_issues: list[str] = []
    current_parent_no: str | None = None
    current_parent_title: str | None = None

    for source_row_index, row in enumerate(source_rows):
        row = row.strip("\r\n\t ")
        if not row:
            continue
        cells = row.split("\x07")
        if len(cells) != 2:
            row_issues.append(
                f"Source row {source_row_index} has {len(cells)} cells; expected 2."
            )
            continue
        left_cell, right_cell = cells
        left = normalized_cell_text(left_cell)
        right = normalized_cell_text(right_cell)

        if source_row_index == 0 and left.lower().startswith("sub-clause"):
            continue

        main_match = MAIN_CLAUSE_PATTERN.match(left)
        if main_match:
            current_parent_no = main_match.group(1)
            current_parent_title = normalized_title(right)
            qc_notes: list[str] = []
            if not current_parent_title:
                qc_notes.append("Main clause title is missing in the Word source row.")
            main_clauses.append(
                {
                    "id": make_clause_id(current_parent_no),
                    "book": "FIDIC Red Book 2017",
                    "edition": "2017",
                    "source_form": "FIDIC 2017 Red",
                    "parent_clause_no": current_parent_no,
                    "parent_clause_title": current_parent_title,
                    "clause_no": current_parent_no,
                    "clause_title": current_parent_title,
                    "level": "main-clause",
                    "original_order": len(main_clauses),
                    "source_text_origin": "Word manual copy",
                    "source_status": "source_text_loaded",
                    "verification_status": "needs_pdf_verification",
                    "parsing_status": "needs_review" if qc_notes else "parsed",
                    "qc_notes": qc_notes,
                    "functional_mappings": [],
                    "tags": [],
                    "clause_elements": [],
                }
            )
            continue

        subclause_match = SUBCLAUSE_PATTERN.match(left)
        if not subclause_match:
            row_issues.append(
                f"Source row {source_row_index} has an unrecognised first cell: {left[:80]!r}."
            )
            continue
        if current_parent_no is None or current_parent_title is None:
            row_issues.append(
                f"Sub-clause row {source_row_index} appears before a main clause heading."
            )
            continue

        clause_no = subclause_match.group(1)
        clause_title = normalized_title(subclause_match.group(2))
        full_text = normalized_full_text(right_cell)
        qc_notes: list[str] = []
        if clause_no.split(".", 1)[0] != current_parent_no:
            qc_notes.append(
                f"Parsed parent Clause {current_parent_no} does not match sub-clause number {clause_no}."
            )
        if not clause_title:
            qc_notes.append("Sub-clause title is missing in the Word source row.")
        if not full_text:
            qc_notes.append("Full text is empty in the Word source row.")
        if "\ufffd" in full_text or "\ufffd" in clause_title:
            qc_notes.append("Unicode replacement character detected in extracted source text.")
        if full_text and INCOMPLETE_END_PATTERN.search(full_text):
            qc_notes.append(
                "Full text ends with an incomplete-looking fragment; wording was preserved exactly as supplied."
            )

        clause = {
            "id": make_clause_id(clause_no),
            "book": "FIDIC Red Book 2017",
            "edition": "2017",
            "source_form": "FIDIC 2017 Red",
            "parent_clause_no": current_parent_no,
            "parent_clause_title": current_parent_title,
            "clause_no": clause_no,
            "clause_title": clause_title,
            "level": "sub-clause",
            "original_order": len(clauses),
            "full_text": full_text,
            "paragraphs": paragraph_records(full_text),
            "literal_cross_references": literal_cross_references(full_text),
            "source_text_origin": "Word manual copy",
            "source_status": "source_text_loaded",
            "verification_status": "needs_pdf_verification",
            "parsing_status": "needs_review" if qc_notes else "parsed",
            "qc_notes": qc_notes,
            "functional_mappings": [],
            "tags": [],
            "clause_elements": [],
        }
        clauses.append(clause)

    for main_clause in main_clauses:
        main_clause["sub_clause_count"] = sum(
            clause["parent_clause_no"] == main_clause["clause_no"]
            for clause in clauses
        )

    numbers = [clause["clause_no"] for clause in clauses]
    duplicate_numbers = sorted(
        number for number, count in Counter(numbers).items() if count > 1
    )
    parent_mismatches = [
        clause["clause_no"]
        for clause in clauses
        if clause["clause_no"].split(".", 1)[0] != clause["parent_clause_no"]
    ]
    needs_review = [
        clause["clause_no"]
        for clause in clauses
        if clause["parsing_status"] == "needs_review"
    ]
    suspicious_terms = Counter(
        match.group(0) for match in SUSPICIOUS_SOURCE_TERMS.finditer(visible)
    )
    qc = {
        "source_row_count": len(source_rows),
        "unparsed_row_issues": row_issues,
        "duplicate_sub_clause_numbers": duplicate_numbers,
        "parent_mismatches": parent_mismatches,
        "missing_number_records": [
            clause["original_order"] for clause in clauses if not clause["clause_no"]
        ],
        "missing_title_records": [
            clause["clause_no"] for clause in clauses if not clause["clause_title"]
        ],
        "empty_full_text_records": [
            clause["clause_no"] for clause in clauses if not clause["full_text"]
        ],
        "needs_review_records": needs_review,
        "suspected_source_terms": dict(suspicious_terms.most_common()),
    }
    return main_clauses, clauses, qc


def build_source_layer(input_path: Path) -> dict[str, Any]:
    document = WordBinaryDocument(input_path)
    raw_text = document.extract_main_text()
    main_clauses, clauses, qc = parse_word_table(raw_text)
    return {
        "schema_version": "1.0",
        "book": "FIDIC Red Book 2017",
        "edition": "2017",
        "source_file": input_path.as_posix(),
        "source_text_origin": "Word manual copy",
        "source_status": "source_text_loaded",
        "verification_status": "needs_pdf_verification",
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "source_sha256": hashlib.sha256(input_path.read_bytes()).hexdigest(),
        "main_clause_count": len(main_clauses),
        "sub_clause_count": len(clauses),
        "main_clauses": main_clauses,
        "clauses": clauses,
        "quality_control": qc,
    }


def validate_source_layer(source_layer: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    main_clauses = source_layer.get("main_clauses", [])
    clauses = source_layer.get("clauses", [])
    main_numbers = [record.get("clause_no") for record in main_clauses]
    if main_numbers != [str(number) for number in range(1, 22)]:
        errors.append(f"Main clause order is not exactly 1 through 21: {main_numbers}")
    numbers = [record.get("clause_no") for record in clauses]
    duplicates = [
        number for number, count in Counter(numbers).items() if number and count > 1
    ]
    if duplicates:
        errors.append(f"Duplicate sub-clause numbers: {sorted(duplicates)}")
    for record in [*main_clauses, *clauses]:
        number = record.get("clause_no")
        if not number:
            errors.append("A record has no clause number.")
        if record.get("source_status") != "source_text_loaded":
            errors.append(f"{number}: invalid source_status")
        if record.get("verification_status") != "needs_pdf_verification":
            errors.append(f"{number}: invalid verification_status")
        for field in ("functional_mappings", "tags", "clause_elements"):
            if record.get(field) != []:
                errors.append(f"{number}: {field} must remain empty")
    for record in clauses:
        if record.get("parent_clause_no") != str(record.get("clause_no", "")).split(".", 1)[0]:
            errors.append(f"{record.get('clause_no')}: assigned to wrong parent")
        if not record.get("full_text"):
            errors.append(f"{record.get('clause_no')}: full_text is empty")
        if not record.get("clause_title"):
            errors.append(f"{record.get('clause_no')}: clause_title is empty")
    return errors


def write_source_layer(source_layer: dict[str, Any], output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(
        json.dumps(source_layer, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def report_markdown(source_layer: dict[str, Any], input_path: Path) -> str:
    qc = source_layer["quality_control"]
    counts = {
        record["clause_no"]: record["sub_clause_count"]
        for record in source_layer["main_clauses"]
    }
    count_rows = "\n".join(
        f"| {number} | {counts[number]} |" for number in map(str, range(1, 22))
    )
    suspected_terms = qc["suspected_source_terms"]
    suspected_text = (
        ", ".join(f"`{term}` ({count})" for term, count in suspected_terms.items())
        if suspected_terms
        else "None detected by the conservative source-text scan."
    )
    review_records = qc["needs_review_records"]
    review_text = ", ".join(review_records) if review_records else "None."
    row_issues = qc["unparsed_row_issues"]
    row_issue_text = "\n".join(f"- {issue}" for issue in row_issues) if row_issues else "- None."
    return f"""# FIDIC 2017 Red Word Import Report

## Import scope

- Input file used: `{input_path.as_posix()}`
- Extraction method: read-only OLE Compound Binary File and Word piece-table parsing, followed by two-cell Word table row parsing.
- Source used for wording: supplied Word manual copy only.
- PDF verification source used: **No**.
- Source SHA-256: `{source_layer['source_sha256']}`

## Record totals

- Main clauses imported: **{source_layer['main_clause_count']}**
- Sub-clauses imported: **{source_layer['sub_clause_count']}**

| Main clause | Imported sub-clause records |
| --- | ---: |
{count_rows}

## Numbering and structure checks

- Main clause sequence: `{', '.join(record['clause_no'] for record in source_layer['main_clauses'])}`
- Duplicate sub-clause numbers: {', '.join(qc['duplicate_sub_clause_numbers']) or 'None.'}
- Parent-clause mismatches: {', '.join(qc['parent_mismatches']) or 'None.'}
- Missing clause numbers: {len(qc['missing_number_records'])}
- Missing titles: {', '.join(qc['missing_title_records']) or 'None.'}
- Empty full-text records: {', '.join(qc['empty_full_text_records']) or 'None.'}

## Source and parsing observations

- Suspected spelling or character issues preserved from the Word manual copy: {suspected_text}
- Records marked `needs_review`: {review_text}
- Paragraph boundaries: Word paragraph marks were retained as line breaks; blank paragraph separation remains in `full_text`, and non-empty paragraphs are also stored in ordered `paragraphs` arrays.
- Uncertain or unparsed source rows:
{row_issue_text}
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
"""


def write_report(source_layer: dict[str, Any], input_path: Path, report_path: Path) -> None:
    report_path.parent.mkdir(parents=True, exist_ok=True)
    report_path.write_text(report_markdown(source_layer, input_path), encoding="utf-8")


def inspect_source(input_path: Path, preview_count: int) -> int:
    document = WordBinaryDocument(input_path)
    raw_text = document.extract_main_text()
    paragraphs = paragraphs_from_word_text(raw_text)
    print(
        json.dumps(
            {
                "input": str(input_path),
                "raw_character_count": len(raw_text),
                "non_empty_paragraph_count": len(paragraphs),
                "ole_streams": sorted(document.compound.directory),
                "replacement_character_count": raw_text.count("\ufffd"),
            },
            ensure_ascii=False,
            indent=2,
        )
    )
    for index, paragraph in enumerate(paragraphs[:preview_count], start=1):
        print(f"{index:04d}\t{paragraph}")
    return 0


def parse_args(argv: Iterable[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", type=Path, help="Legacy Word .doc source")
    parser.add_argument(
        "--inspect",
        action="store_true",
        help="Print source statistics and a paragraph preview without writing data",
    )
    parser.add_argument("--preview-count", type=int, default=160)
    parser.add_argument("--output", type=Path, help="Local full-text JSON output")
    parser.add_argument("--report", type=Path, help="Non-verbatim Markdown import report")
    parser.add_argument(
        "--validate-only",
        action="store_true",
        help="Parse and validate the source without writing output",
    )
    return parser.parse_args(argv)


def main(argv: Iterable[str] | None = None) -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    args = parse_args(argv if argv is not None else sys.argv[1:])
    if not args.input.is_file():
        raise ExtractionError(f"Word source is not accessible: {args.input}")
    if args.inspect:
        return inspect_source(args.input, args.preview_count)
    source_layer = build_source_layer(args.input)
    validation_errors = validate_source_layer(source_layer)
    summary = {
        "main_clause_count": source_layer["main_clause_count"],
        "sub_clause_count": source_layer["sub_clause_count"],
        "needs_review_records": source_layer["quality_control"]["needs_review_records"],
        "validation_errors": validation_errors,
    }
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    if validation_errors:
        raise ExtractionError("Source-layer validation failed; no output was written.")
    if args.validate_only:
        return 0
    if not args.output:
        raise ExtractionError("Use --output for import mode, or --validate-only.")
    write_source_layer(source_layer, args.output)
    if args.report:
        write_report(source_layer, args.input, args.report)
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except ExtractionError as error:
        print(f"ERROR: {error}", file=sys.stderr)
        raise SystemExit(1)
