(function attachPcAlignmentEngine(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.PCAlignmentEngine = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createPcAlignmentEngine() {
  "use strict";

  const ALIGNMENT_STATUSES = [
    "Not Assessed",
    "Exact Match",
    "Target Text Match",
    "Number Match / Heading Difference",
    "Heading Match / Number Difference",
    "Probable Match",
    "Ambiguous",
    "Unmatched",
    "New Clause",
    "Blocking Dependency",
    "Human Confirmed",
    "Rejected"
  ];

  const TARGET_BASES = ["Original Baseline Text", "Current Effective Text", "Unclear"];
  const SUPPORTED_OPERATIONS = [
    "Delete Exact Text",
    "Replace Exact Text",
    "Insert Before",
    "Insert After",
    "Add Paragraph",
    "Delete Entire Sub-Clause",
    "Replace Entire Sub-Clause",
    "Add New Sub-Clause"
  ];
  const EXACT_TARGET_OPERATIONS = ["Delete Exact Text", "Replace Exact Text", "Insert Before", "Insert After", "Add Paragraph"];
  const WHOLE_CLAUSE_OPERATIONS = ["Delete Entire Sub-Clause", "Replace Entire Sub-Clause"];
  const CONTROLLED_SOURCE_SHA256 = "6f3105d20dfd072af1a938b9a78d98f4f5e4ed00b794ce41167112352e75dc19";
  const CONTROLLED_SOURCE_LAYER_SHA256 = "d8777743ebcd4d833a7ff5b0f9da91f81f93820f3ff1d5e48e1b4aa0173368ec";

  function text(value) {
    return value === null || value === undefined ? "" : String(value);
  }

  function normalizeHeading(value) {
    return text(value)
      .trim()
      .toLocaleLowerCase("en")
      .replace(/\s+/g, " ")
      .replace(/\s*([,.;:()\[\]{}\-–—])\s*/g, "$1");
  }

  function extractClauseNumber(value) {
    const candidate = text(value).trim().replace(/^clause\s+/i, "");
    return /^\d+(?:\.\d+)*$/.test(candidate) ? candidate : null;
  }

  function parentNumber(value) {
    const number = extractClauseNumber(value);
    return number ? number.split(".")[0] : null;
  }

  function countExactOccurrences(haystack, needle) {
    const source = text(haystack);
    const target = text(needle);
    if (!target) return 0;
    let count = 0;
    let cursor = 0;
    while (cursor <= source.length - target.length) {
      const index = source.indexOf(target, cursor);
      if (index < 0) break;
      count += 1;
      cursor = index + 1;
    }
    return count;
  }

  function baselineClauses(sourceLayer) {
    const clauses = Array.isArray(sourceLayer) ? sourceLayer : (Array.isArray(sourceLayer?.clauses) ? sourceLayer.clauses : []);
    return clauses.filter((clause) => clause && typeof clause.full_text === "string" && clause.full_text.length > 0);
  }

  function buildBaselineIndex(sourceLayer) {
    const rawClauses = Array.isArray(sourceLayer) ? sourceLayer : (Array.isArray(sourceLayer?.clauses) ? sourceLayer.clauses : []);
    const clauses = baselineClauses(sourceLayer);
    const byNumber = new Map();
    const byId = new Map();
    const byHeading = new Map();
    const duplicateNumbers = new Set();
    const duplicateIds = new Set();
    clauses.forEach((clause) => {
      const number = text(clause.clause_no).trim();
      const id = text(clause.id);
      if (byNumber.has(number)) duplicateNumbers.add(number);
      else byNumber.set(number, clause);
      if (byId.has(id)) duplicateIds.add(id);
      else byId.set(id, clause);
      const heading = normalizeHeading(clause.clause_title);
      if (!byHeading.has(heading)) byHeading.set(heading, []);
      byHeading.get(heading).push(clause);
    });
    const mainClauseNumbers = new Set(
      Array.isArray(sourceLayer?.main_clauses)
        ? sourceLayer.main_clauses.map((clause) => text(clause.clause_no || clause.parent_clause_no).trim())
        : clauses.map((clause) => text(clause.parent_clause_no).trim())
    );
    const invalidClauses = rawClauses.filter((clause) => !clause
      || !text(clause.id).trim()
      || !extractClauseNumber(clause.clause_no)
      || !text(clause.clause_title).trim()
      || typeof clause.full_text !== "string"
      || clause.full_text.length === 0);
    return { clauses, rawClauses, byNumber, byId, byHeading, mainClauseNumbers, duplicateNumbers, duplicateIds, invalidClauses };
  }

  function sourceLayerGate(sourceLayer, { allowDemo = false } = {}) {
    const index = buildBaselineIndex(sourceLayer);
    if (!index.clauses.length) return { ok: false, reason: "The baseline source layer is unavailable or contains no complete Sub-Clause text.", index };
    if (index.invalidClauses.length || index.clauses.length !== index.rawClauses.length) {
      return { ok: false, reason: "The baseline source layer contains incomplete Sub-Clause records and cannot be used for alignment.", index };
    }
    if (index.duplicateNumbers.size || index.duplicateIds.size) return { ok: false, reason: "The baseline source layer contains duplicate clause IDs or numbers.", index };
    if (sourceLayer?.demo_only === true) {
      return allowDemo
        ? { ok: true, reason: null, index }
        : { ok: false, reason: "A synthetic DEMO source cannot be used as the production FIDIC baseline.", index };
    }
    const declaredCountsOk = Number(sourceLayer?.sub_clause_count) === index.rawClauses.length
      && Number(sourceLayer?.main_clause_count) === (Array.isArray(sourceLayer?.main_clauses) ? sourceLayer.main_clauses.length : -1);
    const controlledDatasetCountsOk = Number(sourceLayer?.sub_clause_count) === 215
      && Number(sourceLayer?.main_clause_count) === 21;
    const mainClauses = Array.isArray(sourceLayer?.main_clauses) ? sourceLayer.main_clauses : [];
    const mainNumbers = mainClauses.map((clause) => text(clause?.clause_no || clause?.parent_clause_no).trim());
    const mainIds = mainClauses.map((clause) => text(clause?.id).trim());
    const mainHierarchyOk = mainNumbers.length === 21
      && new Set(mainNumbers).size === 21
      && new Set(mainIds).size === 21
      && mainIds.every(Boolean)
      && Array.from({ length: 21 }, (_, indexValue) => String(indexValue + 1)).every((number) => mainNumbers.includes(number));
    const hierarchyOk = index.rawClauses.every((clause) => {
      const parent = text(clause.parent_clause_no).trim();
      return mainNumbers.includes(parent) && parentNumber(clause.clause_no) === parent;
    });
    const clause5 = mainClauses.find((clause) => text(clause.clause_no) === "5");
    const clause12 = mainClauses.find((clause) => text(clause.clause_no) === "12");
    const regressionTitlesOk = normalizeHeading(clause5?.clause_title || clause5?.parent_clause_title) === "subcontracting"
      && normalizeHeading(clause12?.clause_title || clause12?.parent_clause_title) === "measurement and valuation";
    const identityOk = sourceLayer?.edition === "2017"
      && /FIDIC Red Book 2017/i.test(text(sourceLayer?.book))
      && sourceLayer?.source_status === "source_text_loaded"
      && declaredCountsOk
      && controlledDatasetCountsOk
      && mainHierarchyOk
      && hierarchyOk
      && regressionTitlesOk
      && text(sourceLayer?.source_sha256).toLowerCase() === CONTROLLED_SOURCE_SHA256
      && text(sourceLayer?.runtime_source_layer_sha256).toLowerCase() === CONTROLLED_SOURCE_LAYER_SHA256;
    return { ok: identityOk, reason: identityOk ? null : "The loaded source layer identity or source status is not the controlled FIDIC Red Book 2017 source.", index };
  }

  function effectiveRecordForClause(clause, effectiveClauses) {
    if (!Array.isArray(effectiveClauses)) return null;
    const matches = effectiveClauses.filter((record) => record
      && ((record.baseline_clause_id && record.baseline_clause_id === clause.id)
        || (!record.baseline_clause_id && record.clause_number === clause.clause_no)));
    return matches.length === 1 ? matches[0] : null;
  }

  function clauseTextForBasis(clause, amendment, effectiveClauses) {
    if (amendment?.target_basis !== "Current Effective Text") return clause.full_text;
    const record = effectiveRecordForClause(clause, effectiveClauses);
    return record && typeof record.current_effective_text === "string" ? record.current_effective_text : clause.full_text;
  }

  function exactTargetMatches(index, target, amendment, effectiveClauses) {
    if (!text(target)) return [];
    return index.clauses.flatMap((clause) => {
      const occurrenceCount = countExactOccurrences(clauseTextForBasis(clause, amendment, effectiveClauses), target);
      return occurrenceCount ? [{ clause, occurrenceCount }] : [];
    });
  }

  function fuzzyHeadingCandidates(index, heading) {
    const wanted = normalizeHeading(heading);
    if (!wanted) return [];
    const wantedTokens = new Set(wanted.split(/[^a-z0-9]+/).filter((token) => token.length > 2));
    if (!wantedTokens.size) return [];
    return index.clauses.map((clause) => {
      const candidateTokens = new Set(normalizeHeading(clause.clause_title).split(/[^a-z0-9]+/).filter((token) => token.length > 2));
      const shared = [...wantedTokens].filter((token) => candidateTokens.has(token)).length;
      const denominator = Math.max(wantedTokens.size, candidateTokens.size, 1);
      return { clause, score: shared / denominator };
    }).filter((candidate) => candidate.score >= 0.6).sort((a, b) => b.score - a.score);
  }

  function alignmentResult(status, reason, targetClause, details = {}) {
    return {
      machine_alignment_status: status,
      machine_alignment_reason: reason,
      proposed_target_gc_clause_id: targetClause?.id || null,
      proposed_target_gc_clause_number: targetClause?.clause_no || details.proposedNumber || null,
      proposed_target_gc_heading: targetClause?.clause_title || details.proposedHeading || null,
      target_occurrence_count: details.targetOccurrenceCount ?? null,
      match_evidence: details.matchEvidence || {},
      conflicts: details.conflicts || [],
      blocking_issue: details.blockingIssue || null,
      requires_human_confirmation: status !== "Exact Match" && status !== "Not Assessed",
      supported_operation: SUPPORTED_OPERATIONS.includes(details.operation)
    };
  }

  function alignAmendment(amendment, sourceLayer, project, amendmentIndex = [], effectiveClauses = []) {
    const sourceGate = sourceLayerGate(sourceLayer, { allowDemo: project?.baseline_id === "demo_synthetic_baseline" });
    const index = sourceGate.index;
    const operation = amendment?.amendment_operation;
    const requiresExactTarget = EXACT_TARGET_OPERATIONS.includes(operation);
    const validatesSuppliedTarget = requiresExactTarget || (WHOLE_CLAUSE_OPERATIONS.includes(operation) && Boolean(text(amendment?.target_text)));
    const category = amendment?.amendment_category;
    const targetText = text(amendment?.target_text);
    const suppliedNumber = text(amendment?.target_gc_clause_number).trim();
    const suppliedHeading = text(amendment?.target_gc_heading).trim();
    const suppliedParent = parentNumber(amendment?.parent_clause);
    const dependencyIds = Array.isArray(amendment?.global_dependency_ids) ? amendment.global_dependency_ids : [];
    const blockingDependencies = dependencyIds.filter((id) => {
      const dependency = amendmentIndex.find((entry) => entry.amendment_id === id);
      if (!dependency) return true;
      return ["Defined-term Amendment", "Global Amendment"].includes(dependency.amendment_category)
        ? dependency.application_status !== "Applied and Revalidated"
        : dependency.application_status !== "Applied";
    });

    if (["Defined-term Amendment", "Global Amendment", "Contract Data"].includes(category)) {
      return alignmentResult("Not Assessed", `${category} is registered but deferred outside Task 3.`, null, { operation });
    }
    if (!["Clause-specific Amendment", "New Clause"].includes(category)) {
      return alignmentResult("Not Assessed", "This instruction is not classified for clause-specific alignment.", null, { operation });
    }
    if (!sourceGate.ok) {
      return alignmentResult("Blocking Dependency", sourceGate.reason, null, {
        operation,
        blockingIssue: sourceGate.reason
      });
    }
    if (project && (project.fidic_form !== "Red Book" || project.fidic_edition !== "2017")) {
      return alignmentResult("Unmatched", "The project benchmark is not FIDIC Red Book 2017.", null, {
        operation,
        blockingIssue: "FIDIC form or edition conflict"
      });
    }
    if (blockingDependencies.length) {
      return alignmentResult("Blocking Dependency", "A deferred defined-term or global amendment blocks this clause-specific instruction.", null, {
        operation,
        blockingIssue: `Deferred amendment(s): ${blockingDependencies.join(", ")}`,
        conflicts: blockingDependencies.map((id) => `Deferred dependency ${id}`)
      });
    }

    if (category === "New Clause" || operation === "Add New Sub-Clause") {
      const number = suppliedNumber;
      const inferredParent = parentNumber(number);
      const explicitParent = suppliedParent;
      const conflicts = [];
      let blockingIssue = null;
      if (!number || !/^\d+(?:\.\d+)+$/.test(number)) blockingIssue = "A valid new GC Sub-Clause number is required.";
      else if (index.byNumber.has(number)) blockingIssue = `Sub-Clause ${number} already exists and cannot be overwritten.`;
      if (!explicitParent) conflicts.push("Intended parent clause is not supplied.");
      else if (!index.mainClauseNumbers.has(explicitParent)) conflicts.push(`Parent Clause ${explicitParent} does not exist in the baseline hierarchy.`);
      if (number && explicitParent && inferredParent !== explicitParent) conflicts.push(`New number ${number} is inconsistent with parent clause ${explicitParent}.`);
      if (!text(amendment?.replacement_or_added_text)) conflicts.push("Exact new Sub-Clause text is required.");
      if (!text(amendment?.target_location) && !inferredParent) conflicts.push("An explicit insertion position or reliable numerical position is required.");
      if (!blockingIssue && conflicts.length) blockingIssue = conflicts.join(" ");
      return alignmentResult("New Clause", blockingIssue ? "New-clause data requires human review before application." : "The proposed number is unoccupied and has a reliable numerical position.", null, {
        operation,
        proposedNumber: number || null,
        proposedHeading: suppliedHeading || amendment?.pc_clause_heading || null,
        conflicts,
        blockingIssue,
        matchEvidence: { number_unoccupied: Boolean(number && !index.byNumber.has(number)), parent_clause: explicitParent, numerical_parent: inferredParent }
      });
    }

    const idClause = amendment?.target_gc_clause_id ? index.byId.get(text(amendment.target_gc_clause_id)) || null : null;
    const numberClause = suppliedNumber ? index.byNumber.get(suppliedNumber) || null : null;
    const idNumberConflict = Boolean(idClause && numberClause && idClause.id !== numberClause.id);
    const directClause = numberClause || idClause;
    const globalTargetMatches = exactTargetMatches(index, targetText, amendment, effectiveClauses);
    const globalOccurrenceCount = globalTargetMatches.reduce((sum, item) => sum + item.occurrenceCount, 0);
    const headingMatches = suppliedHeading ? (index.byHeading.get(normalizeHeading(suppliedHeading)) || []) : [];

    if (directClause) {
      const numberMatch = Boolean(suppliedNumber) && text(directClause.clause_no) === suppliedNumber;
      const idMatch = !amendment?.target_gc_clause_id || text(directClause.id) === text(amendment.target_gc_clause_id);
      const headingMatch = Boolean(suppliedHeading) && normalizeHeading(directClause.clause_title) === normalizeHeading(suppliedHeading);
      const parentMatch = Boolean(suppliedParent) && suppliedParent === text(directClause.parent_clause_no || parentNumber(directClause.clause_no));
      const targetCount = validatesSuppliedTarget
        ? countExactOccurrences(clauseTextForBasis(directClause, amendment, effectiveClauses), targetText)
        : null;
      const conflicts = [];
      if (idNumberConflict || !idMatch) conflicts.push("The stored target clause ID and asserted Sub-Clause number identify different baseline records.");
      if (!suppliedHeading) conflicts.push("GC Sub-Clause heading is not supplied.");
      else if (!headingMatch) conflicts.push(`PC heading “${suppliedHeading}” differs from baseline heading “${directClause.clause_title}”.`);
      if (!suppliedParent) conflicts.push("Parent clause is not supplied.");
      else if (!parentMatch) conflicts.push(`Parent clause ${suppliedParent} conflicts with baseline parent ${directClause.parent_clause_no}.`);

      if (requiresExactTarget && !targetText) {
        return alignmentResult("Ambiguous", "The operation requires exact target wording or an exact insertion anchor.", directClause, {
          operation, conflicts, blockingIssue: "Exact target text or anchor is missing", targetOccurrenceCount: 0,
          matchEvidence: { number_match: numberMatch, heading_match: headingMatch, parent_match: parentMatch }
        });
      }
      if (validatesSuppliedTarget && targetCount > 1) {
        return alignmentResult("Ambiguous", `The exact target occurs ${targetCount} times in Sub-Clause ${directClause.clause_no}.`, directClause, {
          operation, conflicts, blockingIssue: "Target text is not unique", targetOccurrenceCount: targetCount,
          matchEvidence: { number_match: numberMatch, heading_match: headingMatch, parent_match: parentMatch }
        });
      }
      if (validatesSuppliedTarget && targetCount === 0) {
        if (globalOccurrenceCount === 1) {
          const targetClause = globalTargetMatches[0].clause;
          return alignmentResult("Target Text Match", `The exact quoted target occurs once, in Sub-Clause ${targetClause.clause_no}, not in the supplied target.`, targetClause, {
            operation,
            conflicts: [...conflicts, `Supplied number ${suppliedNumber} conflicts with target-text location ${targetClause.clause_no}.`],
            targetOccurrenceCount: 1,
            matchEvidence: { supplied_number_match: true, exact_target_global_occurrences: 1 }
          });
        }
        return alignmentResult("Unmatched", "The exact target wording does not occur in the supplied baseline clause.", directClause, {
          operation, conflicts, blockingIssue: "Exact target text not found", targetOccurrenceCount: 0,
          matchEvidence: { number_match: numberMatch, heading_match: headingMatch, parent_match: parentMatch, exact_target_global_occurrences: globalOccurrenceCount }
        });
      }
      if (numberMatch && idMatch && !idNumberConflict && headingMatch && parentMatch && (!validatesSuppliedTarget || targetCount === 1)) {
        return alignmentResult("Exact Match", "Clause number, parent, harmless-normalised heading and any required exact target wording match uniquely.", directClause, {
          operation, targetOccurrenceCount: targetCount,
          matchEvidence: { number_match: numberMatch, heading_match: true, parent_match: true, exact_target_occurrences: targetCount }
        });
      }
      if (targetCount === 1 && parentMatch && (!headingMatch || !numberMatch || !idMatch)) {
        return alignmentResult("Target Text Match", "The exact target wording occurs once in the numbered clause, but the heading conflicts or is missing.", directClause, {
          operation, conflicts, targetOccurrenceCount: 1,
          matchEvidence: { number_match: numberMatch, id_match: idMatch, heading_match: headingMatch, parent_match: true, exact_target_occurrences: 1 }
        });
      }
      if (numberMatch && !headingMatch) {
        return alignmentResult("Number Match / Heading Difference", "The supplied Sub-Clause number exists, but the heading is different or missing.", directClause, {
          operation, conflicts, targetOccurrenceCount: targetCount,
          matchEvidence: { number_match: numberMatch, heading_match: false, parent_match: parentMatch }
        });
      }
      return alignmentResult("Probable Match", "The available identifiers point to this clause, but number, ID or parent evidence is incomplete or conflicting.", directClause, {
        operation, conflicts, targetOccurrenceCount: targetCount,
        matchEvidence: { number_match: numberMatch, heading_match: headingMatch, parent_match: parentMatch }
      });
    }

    if (targetText && globalOccurrenceCount === 1) {
      const targetClause = globalTargetMatches[0].clause;
      return alignmentResult("Target Text Match", `The exact quoted target occurs once in Sub-Clause ${targetClause.clause_no}.`, targetClause, {
        operation,
        conflicts: suppliedNumber ? [`Supplied number ${suppliedNumber} does not identify an existing baseline Sub-Clause.`] : ["No GC Sub-Clause number was supplied."],
        targetOccurrenceCount: 1,
        matchEvidence: { exact_target_global_occurrences: 1 }
      });
    }
    if (targetText && globalOccurrenceCount > 1) {
      return alignmentResult("Ambiguous", `The exact target wording occurs ${globalOccurrenceCount} times across the baseline.`, null, {
        operation,
        conflicts: globalTargetMatches.map((item) => `${item.clause.clause_no}: ${item.occurrenceCount} occurrence(s)`),
        blockingIssue: "Exact target text is not unique",
        targetOccurrenceCount: globalOccurrenceCount,
        matchEvidence: { exact_target_global_occurrences: globalOccurrenceCount }
      });
    }
    if (headingMatches.length === 1) {
      const targetClause = headingMatches[0];
      return alignmentResult("Heading Match / Number Difference", `The harmless-normalised heading matches Sub-Clause ${targetClause.clause_no}, but the supplied number is absent or different.`, targetClause, {
        operation,
        conflicts: suppliedNumber ? [`Supplied number ${suppliedNumber} does not identify this baseline Sub-Clause.`] : ["No GC Sub-Clause number was supplied."],
        targetOccurrenceCount: targetText ? 0 : null,
        matchEvidence: { heading_match: true, number_match: false }
      });
    }
    if (headingMatches.length > 1) {
      return alignmentResult("Ambiguous", `The harmless-normalised heading matches ${headingMatches.length} baseline Sub-Clauses.`, null, {
        operation,
        conflicts: headingMatches.map((clause) => `${clause.clause_no} — ${clause.clause_title}`),
        blockingIssue: "Heading is not unique",
        targetOccurrenceCount: targetText ? 0 : null,
        matchEvidence: { exact_heading_matches: headingMatches.length }
      });
    }
    const probable = fuzzyHeadingCandidates(index, suppliedHeading);
    if (probable.length === 1 || (probable[0] && (!probable[1] || probable[0].score > probable[1].score))) {
      const candidate = probable[0];
      return alignmentResult("Probable Match", `A heading-token candidate was found with ${(candidate.score * 100).toFixed(0)}% overlap. This is not harmless normalisation.`, candidate.clause, {
        operation,
        conflicts: ["Heading words differ; the candidate must not be applied without human confirmation."],
        targetOccurrenceCount: targetText ? 0 : null,
        matchEvidence: { heading_token_overlap: candidate.score }
      });
    }
    return alignmentResult("Unmatched", "No unique exact number, harmless-normalised heading or exact target-text match was found.", null, {
      operation,
      blockingIssue: "No reliable baseline target",
      targetOccurrenceCount: targetText ? 0 : null,
      matchEvidence: { exact_target_global_occurrences: globalOccurrenceCount, exact_heading_matches: headingMatches.length }
    });
  }

  function operationRequirements(operation) {
    return {
      supported: SUPPORTED_OPERATIONS.includes(operation),
      exactTarget: EXACT_TARGET_OPERATIONS.includes(operation),
      replacement: ["Replace Exact Text", "Insert Before", "Insert After", "Add Paragraph", "Replace Entire Sub-Clause", "Add New Sub-Clause"].includes(operation),
      newClause: operation === "Add New Sub-Clause"
    };
  }

  function getEligibility(amendment, sourceLayer, effectiveClause, amendmentIndex = [], { allowDemo = false } = {}) {
    const requirements = operationRequirements(amendment?.amendment_operation);
    const validatesSuppliedTarget = requirements.exactTarget
      || (WHOLE_CLAUSE_OPERATIONS.includes(amendment?.amendment_operation) && Boolean(text(amendment?.target_text)));
    const reasons = [];
    const sourceGate = sourceLayerGate(sourceLayer, { allowDemo });
    if (!sourceGate.ok) reasons.push(sourceGate.reason);
    if (!["Clause-specific Amendment", "New Clause"].includes(amendment?.amendment_category)) reasons.push("Amendment category is deferred or unsupported in Task 3.");
    if (!requirements.supported) reasons.push("Not Yet Supported / Human Review Required.");
    if (!["Exact Match", "Human Confirmed"].includes(amendment?.alignment_status)) reasons.push("Alignment must be Exact Match or Human Confirmed.");
    if (!TARGET_BASES.includes(amendment?.target_basis) || amendment.target_basis === "Unclear") reasons.push("Target basis must be explicitly selected.");
    if (!Number.isInteger(Number(amendment?.sequence_number)) || Number(amendment.sequence_number) < 1) reasons.push("A positive application sequence number is required.");
    if (amendment?.blocking_issue) reasons.push(amendment.blocking_issue);
    if (Array.isArray(amendment?.global_dependency_ids) && amendment.global_dependency_ids.length) reasons.push("A deferred dependency remains recorded.");
    if (!requirements.newClause && !amendment?.target_gc_clause_id && !amendment?.target_gc_clause_number) reasons.push("A baseline target clause is required.");
    if (requirements.exactTarget && !text(amendment?.target_text)) reasons.push("Exact target text or anchor is required.");
    if (requirements.replacement && !text(amendment?.replacement_or_added_text)) reasons.push("Replacement or added text is required.");
    if (amendment?.amendment_operation === "Add Paragraph" && !/^(before|after)\b/i.test(text(amendment?.target_location).trim())) reasons.push("Add Paragraph requires an explicit before/after location.");
    if (requirements.newClause) {
      const index = sourceGate.index;
      const number = text(amendment?.target_gc_clause_number).trim();
      if (!number || !/^\d+(?:\.\d+)+$/.test(number)) reasons.push("A valid new GC Sub-Clause number is required.");
      if (number && index.byNumber.has(number)) reasons.push(`Sub-Clause ${number} already exists.`);
      const parent = parentNumber(amendment?.parent_clause);
      if (!parent) reasons.push("An intended parent clause is required.");
      else if (!index.mainClauseNumbers.has(parent)) reasons.push(`Parent Clause ${parent} does not exist.`);
      if (!text(amendment?.target_location) && !parentNumber(number)) reasons.push("An explicit or reliable numerical insertion position is required.");
    } else {
      const assertedId = text(amendment?.target_gc_clause_id).trim();
      const assertedNumber = text(amendment?.target_gc_clause_number).trim();
      const idClause = assertedId ? sourceGate.index.byId.get(assertedId) || null : null;
      const numberClause = assertedNumber ? sourceGate.index.byNumber.get(assertedNumber) || null : null;
      if (assertedId && !idClause) reasons.push(`Target clause ID ${assertedId} does not exist in the controlled baseline.`);
      if (assertedNumber && !numberClause) reasons.push(`Target Sub-Clause ${assertedNumber} does not exist in the controlled baseline.`);
      if (idClause && numberClause && idClause.id !== numberClause.id) reasons.push("Target clause ID and Sub-Clause number identify different baseline records.");
      const targetClause = numberClause || idClause;
      if (!targetClause) reasons.push("The exact baseline Sub-Clause record is unavailable.");
      const assertedParent = parentNumber(amendment?.parent_clause);
      const controlledParent = targetClause ? text(targetClause.parent_clause_no || parentNumber(targetClause.clause_no)) : null;
      if (!assertedParent) reasons.push("A parent clause is required.");
      else if (targetClause && assertedParent !== controlledParent) reasons.push(`Parent Clause ${assertedParent} does not match controlled parent ${controlledParent}.`);
      const assertedHeading = text(amendment?.target_gc_heading);
      if (!assertedHeading) reasons.push("A GC Sub-Clause heading is required.");
      else if (targetClause && normalizeHeading(assertedHeading) !== normalizeHeading(targetClause.clause_title)) reasons.push("The GC Sub-Clause heading does not match the controlled target heading.");
      if (targetClause && validatesSuppliedTarget) {
        const baselineText = text(targetClause.full_text);
        const currentText = effectiveClause ? text(effectiveClause.current_effective_text) : baselineText;
        const basisText = amendment?.target_basis === "Current Effective Text" ? currentText : baselineText;
        const basisCount = countExactOccurrences(basisText, amendment?.target_text);
        if (basisCount !== 1) reasons.push(`The exact target occurs ${basisCount} times in the selected target-basis version.`);
        if (amendment?.target_basis === "Original Baseline Text" && currentText !== baselineText) {
          const currentCount = countExactOccurrences(currentText, amendment?.target_text);
          if (currentCount !== 1) reasons.push(`The original-baseline target occurs ${currentCount} times in the current effective version and cannot be projected safely.`);
        }
      }
    }
    const targetKey = amendment?.target_gc_clause_id || amendment?.target_gc_clause_number;
    const sameSequence = amendmentIndex.filter((entry) => entry.amendment_id !== amendment?.amendment_id
      && (entry.target_gc_clause_id || entry.target_gc_clause_number) === targetKey
      && Number(entry.sequence_number) === Number(amendment?.sequence_number));
    if (targetKey && sameSequence.length) reasons.push(`Application sequence conflicts with ${sameSequence.map((entry) => entry.amendment_id).join(", ")}.`);
    if (effectiveClause && Array.isArray(effectiveClause.applied_amendment_ids) && effectiveClause.applied_amendment_ids.includes(amendment?.amendment_id)) reasons.push("This amendment is already actively applied.");
    return { eligible: reasons.length === 0, reasons };
  }

  function makeSegments(prefix, changed, suffix) {
    return [
      prefix ? { segment_type: "unchanged", text: prefix } : null,
      changed,
      suffix ? { segment_type: "unchanged", text: suffix } : null
    ].filter(Boolean);
  }

  function applyOperation(operation, inputText, targetText, addedText, targetLocation, options = {}) {
    const input = text(inputText);
    const target = text(targetText);
    const addition = text(addedText);
    if (!SUPPORTED_OPERATIONS.includes(operation)) {
      return { ok: false, outputText: input, occurrenceCount: 0, segments: [], failureReason: "Not Yet Supported / Human Review Required", clauseStatus: "Unresolved" };
    }
    if (operation === "Delete Entire Sub-Clause") {
      if (!input || options.targetExists === false) return { ok: false, outputText: input, occurrenceCount: 0, segments: [], failureReason: "The exact target Sub-Clause does not exist in the input version.", clauseStatus: "Application Failed" };
      return { ok: true, outputText: "", occurrenceCount: 1, segments: [{ segment_type: "deleted", text: input }], failureReason: null, clauseStatus: "Deleted" };
    }
    if (operation === "Replace Entire Sub-Clause") {
      if (!addition) return { ok: false, outputText: input, occurrenceCount: 0, segments: [], failureReason: "Complete replacement text is required.", clauseStatus: "Application Failed" };
      return { ok: true, outputText: addition, occurrenceCount: 1, segments: [{ segment_type: "replaced", original_text: input, text: addition }], failureReason: null, clauseStatus: "Replaced" };
    }
    if (operation === "Add New Sub-Clause") {
      if (options.targetOccupied === true || input) return { ok: false, outputText: input, occurrenceCount: 1, segments: [], failureReason: "The proposed new Sub-Clause number is already occupied.", clauseStatus: "Application Failed" };
      if (!addition) return { ok: false, outputText: input, occurrenceCount: 0, segments: [], failureReason: "Exact new Sub-Clause text is required.", clauseStatus: "Application Failed" };
      return { ok: true, outputText: addition, occurrenceCount: 0, segments: [{ segment_type: "added", text: addition }], failureReason: null, clauseStatus: "New" };
    }

    const occurrenceCount = countExactOccurrences(input, target);
    if (!target || occurrenceCount !== 1) {
      return {
        ok: false,
        outputText: input,
        occurrenceCount,
        segments: [],
        failureReason: !target ? "Exact target text or insertion anchor is required." : `Exact target occurrence count is ${occurrenceCount}; exactly one is required.`,
        clauseStatus: "Application Failed"
      };
    }
    const start = input.indexOf(target);
    const end = start + target.length;
    const prefix = input.slice(0, start);
    const suffix = input.slice(end);

    if (operation === "Delete Exact Text") {
      return { ok: true, outputText: prefix + suffix, occurrenceCount, segments: makeSegments(prefix, { segment_type: "deleted", text: target }, suffix), failureReason: null, clauseStatus: "Amended" };
    }
    if (operation === "Replace Exact Text") {
      if (!addition) return { ok: false, outputText: input, occurrenceCount, segments: [], failureReason: "Replacement text is required.", clauseStatus: "Application Failed" };
      return { ok: true, outputText: prefix + addition + suffix, occurrenceCount, segments: makeSegments(prefix, { segment_type: "replaced", original_text: target, text: addition }, suffix), failureReason: null, clauseStatus: "Amended" };
    }
    if (operation === "Insert Before") {
      if (!addition) return { ok: false, outputText: input, occurrenceCount, segments: [], failureReason: "Added text is required.", clauseStatus: "Application Failed" };
      return { ok: true, outputText: prefix + addition + target + suffix, occurrenceCount, segments: makeSegments(prefix, { segment_type: "added", text: addition }, target + suffix), failureReason: null, clauseStatus: "Amended" };
    }
    if (operation === "Insert After") {
      if (!addition) return { ok: false, outputText: input, occurrenceCount, segments: [], failureReason: "Added text is required.", clauseStatus: "Application Failed" };
      return { ok: true, outputText: prefix + target + addition + suffix, occurrenceCount, segments: makeSegments(prefix + target, { segment_type: "added", text: addition }, suffix), failureReason: null, clauseStatus: "Amended" };
    }
    if (operation === "Add Paragraph") {
      if (!addition) return { ok: false, outputText: input, occurrenceCount, segments: [], failureReason: "New paragraph text is required.", clauseStatus: "Application Failed" };
      const location = text(targetLocation).trim().toLowerCase();
      const before = /^before\b/.test(location);
      const after = /^after\b/.test(location);
      if (!before && !after) return { ok: false, outputText: input, occurrenceCount, segments: [], failureReason: "Add Paragraph requires an explicit before/after location.", clauseStatus: "Application Failed" };
      const outputText = before ? prefix + addition + target + suffix : prefix + target + addition + suffix;
      const segments = before
        ? makeSegments(prefix, { segment_type: "added", text: addition }, target + suffix)
        : makeSegments(prefix + target, { segment_type: "added", text: addition }, suffix);
      return { ok: true, outputText, occurrenceCount, segments, failureReason: null, clauseStatus: "Amended" };
    }
    return { ok: false, outputText: input, occurrenceCount, segments: [], failureReason: "Not Yet Supported / Human Review Required", clauseStatus: "Unresolved" };
  }

  return {
    ALIGNMENT_STATUSES,
    TARGET_BASES,
    SUPPORTED_OPERATIONS,
    EXACT_TARGET_OPERATIONS,
    WHOLE_CLAUSE_OPERATIONS,
    normalizeHeading,
    extractClauseNumber,
    parentNumber,
    countExactOccurrences,
    buildBaselineIndex,
    sourceLayerGate,
    alignAmendment,
    getEligibility,
    applyOperation
  };
});
