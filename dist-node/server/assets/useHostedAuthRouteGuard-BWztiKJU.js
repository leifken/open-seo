import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { u as useSession, i as getCurrentAuthRedirectFromHref, g as getSignInSearch, j as getVerifyEmailSearch } from "./router-BZ-5uDXB.js";
import { aB as isHostedClientAuthMode, aC as isEmailVerificationBypassed } from "../entry.js";
function useHostedAuthRouteGuard() {
  const navigate = useNavigate();
  const { data: session, isPending } = useSession();
  const isHostedMode = isHostedClientAuthMode();
  const emailVerified = session?.user?.emailVerified === true || isEmailVerificationBypassed();
  useEffect(() => {
    if (isPending || !isHostedMode) {
      return;
    }
    const redirectTo = getCurrentAuthRedirectFromHref(window.location.href);
    if (!session?.user?.id) {
      void navigate({
        to: "/sign-in",
        search: getSignInSearch(redirectTo),
        replace: true
      });
      return;
    }
    if (!emailVerified) {
      void navigate({
        to: "/verify-email",
        search: getVerifyEmailSearch(session.user.email, redirectTo),
        replace: true
      });
    }
  }, [
    isPending,
    isHostedMode,
    emailVerified,
    session?.user?.email,
    session?.user?.id,
    navigate
  ]);
  const hasVerifiedHostedSession = !isPending && Boolean(session?.user?.id) && emailVerified;
  return {
    isHostedMode,
    canRenderAuthenticatedContent: !isHostedMode || hasVerifiedHostedSession
  };
}
export {
  useHostedAuthRouteGuard as u
};
