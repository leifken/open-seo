import { aJ as SUBSCRIBE_ROUTE } from "../entry.js";
function buildCheckoutSuccessUrl(redirectTo) {
  const url = new URL(SUBSCRIBE_ROUTE, window.location.origin);
  url.searchParams.set("checkout", "success");
  url.searchParams.set("redirect", redirectTo);
  return url.toString();
}
export {
  buildCheckoutSuccessUrl as b
};
