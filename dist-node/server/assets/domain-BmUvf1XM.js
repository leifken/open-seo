import { l as createSsrRpc } from "./router-CFUJAOTG.js";
import { i as createServerFn, x as domainOverviewSchema, A as domainKeywordsPageRequestSchema, B as domainPagesPageRequestSchema, z as domainKeywordSuggestionsSchema } from "../entry.js";
import { r as requireProjectContext } from "./middleware-CwR3-L1M.js";
const getDomainOverview = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(domainOverviewSchema).handler(createSsrRpc("046776517b68d488e3ee09004a9f31a90f45c35a2b32b60dc538eaaf00a36b9c"));
const getDomainKeywordSuggestions = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(domainKeywordSuggestionsSchema).handler(createSsrRpc("0c8bc9b67b0ea0a9717a6cab4355542e7c451887732f6d9ee99a8f0ed33cf5de"));
const getDomainKeywordsPage = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(domainKeywordsPageRequestSchema).handler(createSsrRpc("048f26ede391a38ee6e00487163fdc66dd0897e3a1cc488354a840bbf9b0b9cf"));
const getDomainPagesPage = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(domainPagesPageRequestSchema).handler(createSsrRpc("02829e30c3478ce6fa128dba7467f3adc8a4086892ed668b6f9ca56a3b1c0c8b"));
export {
  getDomainKeywordSuggestions as a,
  getDomainKeywordsPage as b,
  getDomainPagesPage as c,
  getDomainOverview as g
};
