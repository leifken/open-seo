// Single-admin provisioning for the Node self-host. With registration closed
// (SIGNUP_DISABLED=true) the admin account can't be created through the UI,
// so the server bootstraps it at startup from ADMIN_EMAIL/ADMIN_PASSWORD:
// a `user` row (emailVerified — no mail delivery configured) plus a
// credential `account` row hashed with better-auth's own scrypt helper, so
// the regular email/password sign-in accepts it. The default organization is
// created by the upstream session-create hook on first login.
//
// Idempotent: an existing user with that email is left untouched (the
// password is NOT reset — rotate it via the app's password reset instead).
import { randomUUID } from "node:crypto";
import { hashPassword } from "better-auth/crypto";
import postgres from "postgres";

export async function bootstrapAdminAccount(): Promise<void> {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return;
  if (password.length < 8) {
    throw new Error("ADMIN_PASSWORD must be at least 8 characters");
  }

  const url = process.env.POSTGRES_DATABASE_URL;
  if (!url) throw new Error("POSTGRES_DATABASE_URL is required");
  const sql = postgres(url, { max: 1, prepare: false });

  try {
    const existing = await sql`select id from "user" where email = ${email}`;
    if (existing.length > 0) {
      return;
    }

    const userId = randomUUID();
    const passwordHash = await hashPassword(password);
    await sql.begin(async (tx) => {
      await tx`
        insert into "user" (id, name, email, email_verified, created_at, updated_at)
        values (${userId}, ${email.split("@")[0]}, ${email}, true, now(), now())`;
      await tx`
        insert into account (id, account_id, provider_id, user_id, password, created_at, updated_at)
        values (${randomUUID()}, ${userId}, 'credential', ${userId}, ${passwordHash}, now(), now())`;
    });
    console.log(`[node-runtime] admin account bootstrapped for ${email}`);
  } finally {
    await sql.end();
  }
}
