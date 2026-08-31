import { useMemo } from "react";
import { toast } from "sonner";
import { c as captureClientEvent, p as getStandardErrorMessage, D as downloadCsv, E as buildCsv } from "./router-DHiBnyXs.js";
const KEYWORD_RESEARCH_HEADERS = [
  "Keyword",
  "Volume",
  "CPC",
  "Competition",
  "Score",
  "Intent"
];
function keywordResearchExportRow(row) {
  return [
    row.keyword,
    row.searchVolume ?? "",
    row.cpc ?? "",
    row.competition ?? "",
    row.keywordDifficulty ?? "",
    row.intent
  ];
}
function parseKeywordInput(value) {
  return value.split(/[\n,]/).map((keyword) => keyword.trim()).filter(Boolean);
}
function buildKeywordSearchKey(params) {
  return [
    parseKeywordInput(params.keyword).join(""),
    params.locationCode,
    params.resultLimit,
    params.mode,
    params.clickstream ? "cs" : ""
  ].join("|");
}
function getNextSortParams(currentField, currentDirection, targetField) {
  if (currentField !== targetField) {
    return { sort: targetField, order: "desc" };
  }
  return {
    sort: currentField,
    order: currentDirection === "asc" ? "desc" : "asc"
  };
}
function useSaveAndExportActions(params) {
  const {
    selectedRows,
    rows,
    filteredRows,
    input,
    saveKeywordsMutate,
    setShowSaveDialog
  } = params;
  const handleSaveKeywords = () => {
    if (selectedRows.size === 0) {
      toast.error("Select at least one keyword first");
      return;
    }
    setShowSaveDialog(true);
  };
  const confirmSave = () => {
    const metrics = rows.filter((row) => selectedRows.has(row.keyword)).map((row) => ({
      keyword: row.keyword,
      searchVolume: row.searchVolume,
      cpc: row.cpc,
      competition: row.competition,
      keywordDifficulty: row.keywordDifficulty,
      intent: row.intent,
      monthlySearches: row.trend
    }));
    saveKeywordsMutate(
      {
        projectId: input.projectId,
        keywords: [...selectedRows],
        locationCode: input.locationCode,
        metrics
      },
      {
        onSuccess: () => {
          captureClientEvent("keyword:save", {
            source_feature: "keyword_research",
            keyword_count: selectedRows.size
          });
          toast.success(`Saved ${selectedRows.size} keywords`);
          setShowSaveDialog(false);
        },
        onError: (error) => {
          toast.error(getStandardErrorMessage(error, "Save failed."));
        }
      }
    );
  };
  const sheetsExportRows = useMemo(
    () => filteredRows.map(keywordResearchExportRow),
    [filteredRows]
  );
  const exportCsv = () => {
    if (sheetsExportRows.length === 0) {
      toast.error("No data to export");
      return;
    }
    downloadKeywordResearchCsv(sheetsExportRows);
    captureClientEvent("data:export", {
      source_feature: "keyword_research",
      result_count: sheetsExportRows.length
    });
  };
  return { handleSaveKeywords, confirmSave, exportCsv, sheetsExportRows };
}
function downloadKeywordResearchCsv(rows) {
  const csvRows = rows.map(
    (row) => row.map(
      (cell, idx) => (idx === 2 || idx === 3) && typeof cell === "number" ? cell.toFixed(2) : cell
    )
  );
  downloadCsv(
    "keyword-research.csv",
    buildCsv(KEYWORD_RESEARCH_HEADERS, csvRows)
  );
}
export {
  KEYWORD_RESEARCH_HEADERS as K,
  buildKeywordSearchKey as b,
  downloadKeywordResearchCsv as d,
  getNextSortParams as g,
  keywordResearchExportRow as k,
  parseKeywordInput as p,
  useSaveAndExportActions as u
};
