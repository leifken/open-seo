#!/bin/sh
# Fingerprint of everything that changes the Node client/server build output:
# the envPrefix'd values (keep in sync with envPrefix in vite.config.node.ts)
# plus the code revision. Used by docker-entrypoint.node.sh at start and by
# Dockerfile.node when the build is baked into the image (GitHub Actions), so
# both sides compute it identically.
{ env | grep -E '^(VITE_|AUTH_MODE|BYPASS_EMAIL_VERIFICATION|SIGNUP_DISABLED|GOOGLE_AUTH_DISABLED|AUTHENTIK_AUTH_ENABLED|BILLING_DISABLED|POSTHOG_PUBLIC_KEY|POSTHOG_HOST|TURNSTILE_SITE_KEY)'; echo "commit=${SOURCE_COMMIT:-unknown}"; } | sort | sha256sum | cut -d' ' -f1
