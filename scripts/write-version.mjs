// scripts/write-version.mjs
import { execSync } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

function safe(cmd, fallback) {
  try {
    return execSync(cmd, { stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
  } catch {
    return fallback;
  }
}

// Vercel互換: APP_TAG > git describe > package.json version > v0.0.0
const PKG_VERSION = safe(`node -p "require('./package.json').version"`, "0.0.0");
const TAG =
  process.env.APP_TAG
  || safe("git describe --tags --abbrev=0", "")
  || (PKG_VERSION ? `v${PKG_VERSION}` : "v0.0.0");

// Vercel互換: VERCEL_GIT_COMMIT_SHA > git rev-parse > unknown
const COMMIT = (process.env.VERCEL_GIT_COMMIT_SHA || safe("git rev-parse --short HEAD", "unknown")).slice(0, 7);
const BUILT_AT = new Date().toISOString();

const out = `// auto-generated. DO NOT EDIT.
export const APP_VERSION = "${TAG}";
export const COMMIT = "${COMMIT}";
export const BUILT_AT = "${BUILT_AT}";
`;

mkdirSync(dirname("src/version.ts"), { recursive: true });
writeFileSync("src/version.ts", out);
console.log(`[version] ${TAG} (${COMMIT}) @ ${BUILT_AT}`);
