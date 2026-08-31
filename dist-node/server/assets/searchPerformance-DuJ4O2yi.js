import { jsx } from "react/jsx-runtime";
import { createColumnHelper } from "@tanstack/react-table";
import { K as makeSelectionColumn, S as SortableHeader, l as createSsrRpc } from "./router-CFUJAOTG.js";
import { i as createServerFn } from "../entry.js";
import { r as requireProjectContext } from "./middleware-CwR3-L1M.js";
import { s as searchPerformanceInputSchema, a as searchPerformanceTableInputSchema, b as searchPerformanceTableExportInputSchema } from "./search-performance-DEaTIWHa.js";
const numberFormat = new Intl.NumberFormat("en-US");
function formatCount(value) {
  return numberFormat.format(Math.round(value));
}
function formatCtr(value) {
  return `${(value * 100).toFixed(1)}%`;
}
function formatPosition(value) {
  return value.toFixed(1);
}
const rightAligned = {
  headerClassName: "text-right",
  cellClassName: "text-right tabular-nums"
};
const dimensionHelper = createColumnHelper();
function buildDimensionColumns(keyLabel) {
  return [
    dimensionHelper.accessor("key", {
      enableSorting: false,
      header: () => keyLabel,
      cell: ({ getValue }) => /* @__PURE__ */ jsx("span", { className: "block max-w-xl truncate", title: getValue(), children: getValue() })
    }),
    dimensionHelper.accessor("clicks", {
      header: ({ column }) => /* @__PURE__ */ jsx(SortableHeader, { column, label: "Clicks", align: "right" }),
      cell: ({ getValue }) => formatCount(getValue()),
      meta: rightAligned
    }),
    dimensionHelper.accessor("impressions", {
      header: ({ column }) => /* @__PURE__ */ jsx(SortableHeader, { column, label: "Impressions", align: "right" }),
      cell: ({ getValue }) => formatCount(getValue()),
      meta: rightAligned
    }),
    dimensionHelper.accessor("ctr", {
      header: ({ column }) => /* @__PURE__ */ jsx(SortableHeader, { column, label: "CTR", align: "right" }),
      cell: ({ getValue }) => formatCtr(getValue()),
      meta: rightAligned
    }),
    dimensionHelper.accessor("position", {
      header: ({ column }) => /* @__PURE__ */ jsx(SortableHeader, { column, label: "Position", align: "right" }),
      cell: ({ getValue }) => formatPosition(getValue()),
      meta: rightAligned
    })
  ];
}
const strikingHelper = createColumnHelper();
function buildStrikingColumns(anchorRef) {
  return [
    makeSelectionColumn(anchorRef),
    strikingHelper.accessor("query", {
      enableSorting: false,
      header: () => "Query",
      cell: ({ getValue }) => /* @__PURE__ */ jsx("span", { className: "block max-w-xs truncate", title: getValue(), children: getValue() })
    }),
    strikingHelper.accessor("page", {
      enableSorting: false,
      header: () => "Page",
      // GSC page keys are canonical http(s) URLs of the verified property;
      // the scheme check is defense-in-depth before rendering an href.
      cell: ({ getValue }) => /^https?:\/\//.test(getValue()) ? /* @__PURE__ */ jsx(
        "a",
        {
          href: getValue(),
          target: "_blank",
          rel: "noreferrer",
          className: "link link-hover block max-w-sm truncate",
          title: getValue(),
          children: getValue()
        }
      ) : /* @__PURE__ */ jsx("span", { className: "block max-w-sm truncate", title: getValue(), children: getValue() })
    }),
    strikingHelper.accessor("impressions", {
      header: ({ column }) => /* @__PURE__ */ jsx(SortableHeader, { column, label: "Impressions", align: "right" }),
      cell: ({ getValue }) => formatCount(getValue()),
      meta: rightAligned
    }),
    strikingHelper.accessor("clicks", {
      header: ({ column }) => /* @__PURE__ */ jsx(SortableHeader, { column, label: "Clicks", align: "right" }),
      cell: ({ getValue }) => formatCount(getValue()),
      meta: rightAligned
    }),
    strikingHelper.accessor("position", {
      header: ({ column }) => /* @__PURE__ */ jsx(SortableHeader, { column, label: "Position", align: "right" }),
      cell: ({ getValue }) => formatPosition(getValue()),
      meta: rightAligned
    })
  ];
}
const getSearchPerformanceReport = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(searchPerformanceInputSchema).handler(createSsrRpc("a251675043aa688af223c180c37e19f98f6652a33f993dc7d1b14c4ce4ed3589"));
const getSearchPerformanceTable = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(searchPerformanceTableInputSchema).handler(createSsrRpc("a4aee3230867065a09c55145cf58c1f5bc0fb9ed2f053bda4ac2d635a4d2bcb4"));
const exportSearchPerformanceTable = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(searchPerformanceTableExportInputSchema).handler(createSsrRpc("03f6b933adea1749a90a3091b941383771384ee499865ac928e32750bb3b6da1"));
export {
  formatCtr as a,
  formatPosition as b,
  buildStrikingColumns as c,
  buildDimensionColumns as d,
  getSearchPerformanceTable as e,
  formatCount as f,
  getSearchPerformanceReport as g,
  exportSearchPerformanceTable as h
};
