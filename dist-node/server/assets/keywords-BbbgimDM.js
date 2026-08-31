import { m as createSsrRpc } from "./router-BZ-5uDXB.js";
import { h as createServerFn, m as getSavedKeywordsSchema, q as removeSavedKeywordsSchema, u as updateSavedKeywordTagsSchema, t as refreshSavedKeywordMetricsSchema, l as saveKeywordsSchema, p as deleteSavedKeywordTagSchema, o as updateSavedKeywordTagSchema, n as exportSavedKeywordsSchema, v as serpAnalysisSchema, i as researchKeywordsSchema } from "../entry.js";
import { r as requireProjectContext } from "./middleware-CvzXieP6.js";
const researchKeywords = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(researchKeywordsSchema).handler(createSsrRpc("fa088bd63c78c66cb4de7e8be1d7567e0ec901107ad1afe33e0ffbeecc57bfbc"));
const saveKeywords = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(saveKeywordsSchema).handler(createSsrRpc("1d75d4deb3fcbaf04305fae69c64722313c46f5620de0ece3b950cff9346e099"));
const getSavedKeywords = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(getSavedKeywordsSchema).handler(createSsrRpc("8acb99c0e5b1aed5cfb75318e78747749f8c2c54884ba18ff1c945a9b06a9375"));
const exportSavedKeywords = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(exportSavedKeywordsSchema).handler(createSsrRpc("0146a46bbe4471991fcb6663852023dad568931c1314b55cc81892ca37f08e45"));
const updateSavedKeywordTags = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(updateSavedKeywordTagsSchema).handler(createSsrRpc("0f196e5eafbe1adb2d3f31aa7558728e7648574a837571aa8f8f35b94a56d562"));
const updateSavedKeywordTag = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(updateSavedKeywordTagSchema).handler(createSsrRpc("3b7a7d39821bb858a8e568dde7f4b7c984fdcbb1b94e2a1b26d91fdf25ff537f"));
const deleteSavedKeywordTag = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(deleteSavedKeywordTagSchema).handler(createSsrRpc("9ce7a2858b82783ef908f4396d61f4645b09ab4cbc435936a1495f8c23bcdb8d"));
const removeSavedKeywords = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(removeSavedKeywordsSchema).handler(createSsrRpc("1e8f375975f9b25f935c01e1ed6d63147b5a7fe8693c2737dcc1869d8ef97f3b"));
const refreshSavedKeywordMetrics = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(refreshSavedKeywordMetricsSchema).handler(createSsrRpc("0a0791b200d03eb44d9630e461ef914d1da85bde9c95b201dcbeb94624848971"));
const getSerpAnalysis = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(serpAnalysisSchema).handler(createSsrRpc("a19f7c4228fdbf301aeba791a8732ae65a0018a25d353bdeed6343876396dd0d"));
export {
  removeSavedKeywords as a,
  updateSavedKeywordTags as b,
  refreshSavedKeywordMetrics as c,
  deleteSavedKeywordTag as d,
  exportSavedKeywords as e,
  getSerpAnalysis as f,
  getSavedKeywords as g,
  researchKeywords as r,
  saveKeywords as s,
  updateSavedKeywordTag as u
};
