function getBillingRouteState(args) {
  if (args.isSessionPending || !args.hasSession || args.isCustomerLoading) {
    return "loading";
  }
  if (args.isCustomerError) {
    return "error";
  }
  return "ready";
}
function getSubscribeRouteState(args) {
  if (!args.hasSession || args.isCustomerLoading) {
    return "loading";
  }
  if (args.checkoutCompleted && args.finalizingTimedOut) {
    return "redirectToApp";
  }
  if (args.isCustomerError) {
    return "error";
  }
  if (args.planStatus === "paid") {
    return "redirectToApp";
  }
  if (args.checkoutCompleted) {
    return "finalizing";
  }
  if (args.hasManagedAccess && !args.isUpgradeFlow) {
    return "redirectToApp";
  }
  return "showPaywall";
}
export {
  getBillingRouteState as a,
  getSubscribeRouteState as g
};
