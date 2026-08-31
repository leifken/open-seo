import { jsxs, jsx } from "react/jsx-runtime";
import { L as LocationSelect } from "./LocationSelect-D9KloY89.js";
import { aE as getLanguageOptions, a8 as getLanguageCode } from "../entry.js";
function ProjectMarketFields({
  value,
  onChange,
  hideLanguageOnMobile = false
}) {
  const languageOptions = getLanguageOptions(value.locationCode);
  return /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
    /* @__PURE__ */ jsxs("label", { className: "flex flex-col gap-1.5 text-sm", children: [
      /* @__PURE__ */ jsx("span", { className: "font-medium", children: "Country" }),
      /* @__PURE__ */ jsx(
        LocationSelect,
        {
          value: value.locationCode,
          onChange: (locationCode) => onChange({
            locationCode,
            languageCode: getLanguageCode(locationCode)
          })
        }
      )
    ] }),
    /* @__PURE__ */ jsxs(
      "label",
      {
        className: `${hideLanguageOnMobile ? "hidden sm:flex" : "flex"} flex-col gap-1.5 text-sm`,
        children: [
          /* @__PURE__ */ jsx("span", { className: "font-medium", children: "Language" }),
          /* @__PURE__ */ jsx(
            "select",
            {
              value: value.languageCode,
              onChange: (event) => onChange({ ...value, languageCode: event.target.value }),
              disabled: languageOptions.length <= 1,
              className: "select select-bordered w-full",
              children: languageOptions.map((option) => /* @__PURE__ */ jsx("option", { value: option.code, children: option.label }, option.code))
            }
          )
        ]
      }
    )
  ] });
}
export {
  ProjectMarketFields as P
};
