(function attachSourceDisplay(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.SourceDisplay = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createSourceDisplay() {
  "use strict";

  function resolveSourceDisplayState(record) {
    if (record?.is_container_clause === true) {
      return {
        key: "container",
        status: "container_clause",
        message: "no independent text — see sub-clauses",
        childClauseNumbers: Array.isArray(record.child_clause_numbers)
          ? record.child_clause_numbers.map((number) => String(number))
          : []
      };
    }

    if (typeof record?.full_text === "string" && record.full_text.length > 0) {
      return {
        key: "loaded",
        status: "source_text_loaded",
        message: "Text loaded from source layer.",
        childClauseNumbers: []
      };
    }

    return {
      key: "missing",
      status: "source_text_not_loaded",
      message: "Full clause text not loaded in source layer.",
      childClauseNumbers: []
    };
  }

  return { resolveSourceDisplayState };
});
