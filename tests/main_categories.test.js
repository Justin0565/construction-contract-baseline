"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const MainCategories = require("../main_categories.js");

const modules = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "modules.json"), "utf8"));

test("modules.json supplies seven unique Main Categories in canonical order", () => {
  const validated = MainCategories.validate(modules);
  assert.deepEqual(validated.map(({ id, name, nameZh }) => ({ id, name, nameZh })), [
    { id: "scope_and_works", name: "Scope & Interface", nameZh: "工程范围与界面" },
    { id: "time", name: "Time", nameZh: "时间" },
    { id: "payment_and_price", name: "Payment & Price", nameZh: "付款与对价" },
    { id: "risk_allocation", name: "Risk Allocation", nameZh: "风险分配" },
    { id: "liability_and_remedies", name: "Liability & Remedies", nameZh: "责任与救济" },
    { id: "claims_and_disputes", name: "Claims & Disputes", nameZh: "索赔与争议" },
    { id: "contract_mechanics", name: "Contract Mechanics", nameZh: "合同螺丝钉" }
  ]);
});

test("legacy stored Main Category values resolve only at display time", () => {
  const validated = MainCategories.validate(modules);
  assert.equal(MainCategories.displayText([], "Scope & Works > Variation"), "Scope & Works > Variation");
  assert.equal(MainCategories.name(validated, "Scope & Works"), "Scope & Interface");
  assert.equal(MainCategories.name(validated, "scope-works", "zh"), "工程范围与界面");
  assert.equal(
    MainCategories.displayText(validated, "scope_and_works > Approved tag mapping"),
    "Scope & Interface > Approved tag mapping"
  );
  assert.equal(
    MainCategories.displayText(validated, "Scope & Works > Variation / Time & Completion"),
    "Scope & Interface > Variation / Time"
  );
});

test("module validation rejects partial, duplicate and malformed input atomically", () => {
  assert.throws(() => MainCategories.validate(modules.slice(0, 6)), /exactly 7/);
  assert.throws(() => MainCategories.validate(modules.map((record, index) => (
    index === 1 ? { ...record, id: modules[0].id } : record
  ))), /duplicate id/);
  assert.throws(() => MainCategories.validate(modules.map((record, index) => (
    index === 2 ? { ...record, nameZh: "" } : record
  ))), /nameZh/);
});
