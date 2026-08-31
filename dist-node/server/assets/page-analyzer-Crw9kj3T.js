import { Parser } from "htmlparser2";
import { as as normalizeUrl, at as isSameOrigin } from "../entry.js";
import "node:async_hooks";
import "node:crypto";
import "ioredis";
import "node:fs/promises";
import "node:path";
import "node:fs";
import "better-sqlite3";
import "bullmq";
import "postgres";
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
const SKIPPED_LINK_PROTOCOLS = /^(javascript:|mailto:|tel:|#)/;
const NON_CONTENT_TAGS = /* @__PURE__ */ new Set(["script", "style", "noscript", "svg"]);
const HEADING_LEVELS = {
  h1: 1,
  h2: 2,
  h3: 3,
  h4: 4,
  h5: 5,
  h6: 6
};
const MAX_ANCHOR_CHARS = 200;
const MAX_EXTRACTED_LINKS = 1e3;
const MAX_EXTRACTED_IMAGES = 1e3;
function analyzeHtml(html, pageUrl, statusCode, responseTimeMs, redirectUrl = null) {
  let title = null;
  let titleDepth = 0;
  let titleDone = false;
  let noscriptDepth = 0;
  let metaDescription = null;
  let canonical = null;
  let robotsMeta = null;
  let ogTitle = null;
  let ogDescription = null;
  let ogImage = null;
  let hasStructuredData = false;
  const hreflangTags = [];
  const h1s = [];
  const headingOrder = [];
  let openH1 = null;
  const images = [];
  const linksByTarget = /* @__PURE__ */ new Map();
  let openAnchor = null;
  let suppressDepth = 0;
  let bodyDepth = 0;
  let headDepth = 0;
  let sawBody = false;
  const bodyParts = [];
  const fallbackParts = [];
  const handleMetaTag = (attribs) => {
    const content = attribs["content"];
    if (attribs["name"] === "description") {
      metaDescription ??= content?.trim() ?? "";
    } else if (attribs["name"] === "robots") {
      robotsMeta ??= content ?? null;
    } else if (attribs["property"] === "og:title") {
      ogTitle ??= content ?? null;
    } else if (attribs["property"] === "og:description") {
      ogDescription ??= content ?? null;
    } else if (attribs["property"] === "og:image") {
      ogImage ??= content ?? null;
    }
  };
  const handleLinkTag = (attribs) => {
    if (attribs["rel"] === "canonical") {
      canonical ??= attribs["href"] ?? null;
    } else if (attribs["rel"] === "alternate" && attribs["hreflang"]) {
      hreflangTags.push(attribs["hreflang"]);
    }
  };
  const closeAnchor = () => {
    if (!openAnchor) return;
    const { href, rel, text } = openAnchor;
    openAnchor = null;
    if (linksByTarget.size >= MAX_EXTRACTED_LINKS) return;
    const resolved = normalizeUrl(href, pageUrl);
    if (!resolved || linksByTarget.has(resolved)) return;
    const anchor = text.join("").replace(/\s+/g, " ").trim().slice(0, MAX_ANCHOR_CHARS);
    linksByTarget.set(resolved, {
      targetUrl: resolved,
      anchor: anchor || null,
      isInternal: isSameOrigin(resolved, pageUrl),
      isNofollow: rel.split(/\s+/).includes("nofollow")
    });
  };
  const parser = new Parser(
    {
      onopentag(name, attribs) {
        if (NON_CONTENT_TAGS.has(name)) {
          suppressDepth += 1;
        }
        if (name === "noscript") noscriptDepth += 1;
        if (noscriptDepth > 0) return;
        switch (name) {
          case "title":
            if (!titleDone && suppressDepth === 0) {
              titleDepth += 1;
              if (title === null) title = "";
            }
            break;
          case "head":
            headDepth += 1;
            break;
          case "body":
            bodyDepth += 1;
            sawBody = true;
            break;
          case "meta":
            handleMetaTag(attribs);
            break;
          case "link":
            handleLinkTag(attribs);
            break;
          case "img":
            if (images.length < MAX_EXTRACTED_IMAGES) {
              images.push({
                src: attribs["src"] ?? null,
                alt: "alt" in attribs ? attribs["alt"] : null
              });
            }
            break;
          case "script":
            if (attribs["type"] === "application/ld+json") {
              hasStructuredData = true;
            }
            break;
          case "a": {
            closeAnchor();
            const href = attribs["href"];
            if (href && !SKIPPED_LINK_PROTOCOLS.test(href)) {
              openAnchor = {
                href,
                rel: attribs["rel"]?.toLowerCase() ?? "",
                text: []
              };
            }
            break;
          }
        }
        const headingLevel = HEADING_LEVELS[name];
        if (headingLevel !== void 0) {
          headingOrder.push(headingLevel);
          if (headingLevel === 1 && openH1 === null) openH1 = [];
        }
      },
      ontext(text) {
        if (suppressDepth > 0) return;
        if (titleDepth > 0) {
          if (title !== null) title += text;
          return;
        }
        if (openH1) openH1.push(text);
        if (openAnchor) openAnchor.text.push(text);
        if (bodyDepth > 0) {
          bodyParts.push(text);
        } else if (headDepth === 0) {
          fallbackParts.push(text);
        }
      },
      onclosetag(name) {
        if (NON_CONTENT_TAGS.has(name) && suppressDepth > 0) {
          suppressDepth -= 1;
        }
        if (name === "noscript" && noscriptDepth > 0) {
          noscriptDepth -= 1;
          return;
        }
        if (noscriptDepth > 0) return;
        if (name === "title" && titleDepth > 0) {
          titleDepth -= 1;
          if (titleDepth === 0) titleDone = true;
        }
        if (name === "head" && headDepth > 0) headDepth -= 1;
        if (name === "body" && bodyDepth > 0) bodyDepth -= 1;
        if (name === "a") closeAnchor();
        if (name === "h1" && openH1) {
          h1s.push(openH1.join("").trim());
          openH1 = null;
        }
      }
    }
    // Defaults (non-XML mode): lowercased tag/attribute names, decoded
    // entities — matching what the DOM-based implementation saw.
  );
  parser.write(html);
  parser.end();
  const rawText = (sawBody ? bodyParts : fallbackParts).join("");
  const bodyText = rawText.replace(/\s+/g, " ").trim();
  const wordCount = bodyText ? bodyText.split(/\s+/).length : 0;
  return {
    url: pageUrl,
    statusCode,
    redirectUrl,
    responseTimeMs,
    title: (title ?? "").trim(),
    metaDescription: metaDescription ?? "",
    canonical,
    robotsMeta,
    ogTitle,
    ogDescription,
    ogImage,
    h1s,
    headingOrder,
    wordCount,
    bodyText,
    images,
    links: Array.from(linksByTarget.values()),
    hasStructuredData,
    hreflangTags
  };
}
export {
  analyzeHtml
};
