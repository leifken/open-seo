import { randomUUID } from "node:crypto";
import { h as hashPassword$1 } from "../entry.js";
import postgres from "postgres";
import "node:async_hooks";
import "ioredis";
import "node:fs/promises";
import "node:path";
import "node:fs";
import "better-sqlite3";
import "bullmq";
import "zod";
import "@modelcontextprotocol/client";
import "@modelcontextprotocol/client/validators/cf-worker";
import "@modelcontextprotocol/sdk/types.js";
import "node:diagnostics_channel";
import "jose";
import "drizzle-orm/d1";
import "drizzle-orm/sqlite-core";
import "drizzle-orm";
import "drizzle-orm/postgres-js";
import "drizzle-orm/pg-core";
import "jose/errors";
import "node:os";
import "@better-auth/api-key";
import "posthog-node";
import "@modelcontextprotocol/server";
import "remeda";
import "tldts";
import "srvx";
import "react";
import "@tanstack/react-router";
import "react/jsx-runtime";
import "@tanstack/react-router/ssr/server";
import "robots-parser";
import "fast-xml-parser";
async function bootstrapAdminAccount() {
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
    const passwordHash = await hashPassword$1(password);
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
export {
  bootstrapAdminAccount
};
