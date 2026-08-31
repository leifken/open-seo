import { jsx } from "react/jsx-runtime";
import { B as scoreTierClass } from "./router-DHiBnyXs.js";
function DifficultyBadge({ value }) {
  if (value == null) {
    return /* @__PURE__ */ jsx(
      "span",
      {
        className: `score-badge ${scoreTierClass(null)} inline-flex size-6 items-center justify-center rounded-full text-[10px] font-semibold tabular-nums`,
        children: "—"
      }
    );
  }
  return /* @__PURE__ */ jsx(
    "span",
    {
      className: `score-badge ${scoreTierClass(value)} inline-flex size-6 items-center justify-center rounded-full text-[10px] font-semibold tabular-nums`,
      children: value
    }
  );
}
export {
  DifficultyBadge as D
};
