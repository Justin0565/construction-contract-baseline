# Construction Contract Baseline

## Current pilot scope

This static legal-research prototype models **Scope & Works / 工程范围与工作内容** as a practical construction-performance system. It is not a FIDIC clause directory: performance categories, nodes and elements form the product model; FIDIC clauses are the source and verification layer.

The current hierarchy is:

1. Main Contract System — `scope_and_works`
2. Practice Category — four practical categories
3. Performance Node — 27 performance subjects
4. Clause Element — 69 atomic legal/operational elements
5. Source Layer — 70 FIDIC 2017 Red clause records
6. Mapping Layer — element-to-clause mappings
7. Tag Layer — express legal-effect classifications

Work on Time & Completion, Price & Payment, Risk & Protection, Default / Remedies / Termination and Claims / Disputes is outside this pilot except for cross-links and legal-effect tags.

## Run locally

Open a terminal in this project folder.

Windows:

```powershell
py -m http.server 8000
```

Mac/Linux:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000/`.

No installation, build step, package manager, framework, database or external dependency is required. If JSON cannot be loaded, the interface shows compact fallback data rather than a blank page.

## Data files

- `data/modules.json` — Main Contract System record.
- `data/practice_categories.json` — four Scope & Works practice categories.
- `data/performance_nodes.json` — practical performance nodes linked by `practice_category_id`.
- `data/clause_elements.json` — atomic elements linked by `performance_node_id`, with clause references, legal-effect tags and tag reasons.
- `data/tags.json` — the controlled 17-tag vocabulary, including separate EOT, Deduction, Withholding and Set-off tags.
- `data/fidic_2017_red_clauses.json` — FIDIC 2017 Red source-library records.
- `data/node_clause_map.json` — primary element-to-clause mappings and review status.
- `data/tag_clause_index.json` — denormalised index used for tag exploration.

IDs are the joins between files. Do not change an ID without updating every file that refers to it.

## Source-text status

No licensed clause-source files were available under `/source` or `/data/source` when this pilot was built. Therefore every source-library record contains:

```json
"full_clause_text": "[SOURCE TEXT NOT YET LOADED]",
"verification_status": "source_text_not_loaded"
```

Do not replace the placeholder with recalled, reconstructed or unlicensed wording. When an authorised source is added, copy or parse it accurately, record provenance, then complete lawyer verification.

## Tagging discipline

Tags apply only at Clause Element level. Every applied tag has an express `tag_reason` and remains `needs_lawyer_review` until source text is loaded and checked. Empty tag arrays are intentional where express legal effect has not been verified.

Ordinary Variation adjustment under the Variation by Instruction route is intentionally **not** tagged `claim`: the model separates the ordinary Clause 13 adjustment route from a Sub-Clause 20.2 Claim.

## Product boundary

This is a baseline-modelling prototype only. It does not parse Particular Conditions, review project contracts or draft amendments. Those remain future subsystems.
