(function attachMainCategories(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.MainCategories = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createMainCategories() {
  "use strict";

  const EXPECTED_COUNT = 7;
  const LEGACY_VALUE_TO_INDEX = Object.freeze({
    "Scope & Works": 0,
    "scope-works": 0,
    "Time & Completion": 1,
    "time-completion": 1,
    "Price & Payment": 2,
    "price-payment": 2,
    "Risk & Protection": 3,
    "risk-protection": 3,
    "Default, Remedies & Termination": 4,
    "default-remedies-termination": 4,
    "Claims, Determination & Disputes": 5,
    "Claims & Dispute Procedure": 5,
    "claims-determination-disputes": 5,
    "contract-mechanics": 6
  });

  function requiredString(record, field, index) {
    if (typeof record?.[field] !== "string" || !record[field].trim()) {
      throw new Error(`modules[${index}].${field} must be a non-empty string`);
    }
  }

  function validate(records) {
    if (!Array.isArray(records) || records.length !== EXPECTED_COUNT) {
      throw new Error(`modules.json must contain exactly ${EXPECTED_COUNT} Main Categories`);
    }
    const ids = new Set();
    const names = new Set();
    records.forEach((record, index) => {
      ["id", "name", "nameZh", "accent"].forEach((field) => requiredString(record, field, index));
      if (typeof record.hasLogic !== "boolean") throw new Error(`modules[${index}].hasLogic must be boolean`);
      if (!/^[a-z][a-z0-9_]*$/.test(record.id)) throw new Error(`modules[${index}].id must be a stable snake_case identifier`);
      if (!/^#[0-9a-f]{6}$/i.test(record.accent)) throw new Error(`modules[${index}].accent must be a six-digit hex colour`);
      if (ids.has(record.id)) throw new Error(`modules.json contains duplicate id ${record.id}`);
      if (names.has(record.name)) throw new Error(`modules.json contains duplicate name ${record.name}`);
      ids.add(record.id);
      names.add(record.name);
    });
    return records.map((record) => ({ ...record }));
  }

  function find(records, value) {
    const raw = String(value ?? "").trim();
    const direct = records.find((record) => record.id === raw || record.name === raw);
    if (direct) return direct;
    const legacyIndex = LEGACY_VALUE_TO_INDEX[raw];
    return Number.isInteger(legacyIndex) ? records[legacyIndex] || null : null;
  }

  function name(records, value, language = "en") {
    const record = find(records, value);
    if (!record) return String(value ?? "");
    return language === "zh" ? record.nameZh : record.name;
  }

  function displayText(records, value) {
    let output = String(value ?? "");
    Object.entries(LEGACY_VALUE_TO_INDEX)
      .sort(([left], [right]) => right.length - left.length)
      .forEach(([legacy, index]) => {
        const replacement = records[index]?.name;
        if (replacement) output = output.split(legacy).join(replacement);
      });
    records.forEach((record) => {
      output = output.split(record.id).join(record.name);
    });
    return output;
  }

  return {
    EXPECTED_COUNT,
    validate,
    find,
    name,
    displayText
  };
});
