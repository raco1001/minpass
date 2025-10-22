#!/usr/bin/env node

/**
 * Debug script to check actual paths
 */

const { resolve } = require("path");
const fs = require("fs");

console.log("🔍 Path Debugging\n");
console.log("=".repeat(60));

console.log("\n📂 Current Working Directory (process.cwd()):");
console.log("  ", process.cwd());

console.log("\n📂 __dirname would be (simulated):");
console.log("   dist build:", resolve(process.cwd(), "dist/apps/apis"));

console.log("\n🎯 Calculated .env paths:");

const paths = [
  resolve(process.cwd(), "apps/apis/.env.local"),
  resolve(process.cwd(), "apps/apis/.env"),
  resolve(process.cwd(), "dist/apps/apis/../../../apps/apis/.env.local"),
  resolve(process.cwd(), "dist/apps/apis/../../../apps/apis/.env"),
];

paths.forEach((path, idx) => {
  const exists = fs.existsSync(path);
  console.log(`\n  [${idx + 1}] ${exists ? "✅" : "❌"} ${path}`);
  if (exists) {
    const content = fs.readFileSync(path, "utf8");
    const lines = content
      .split("\n")
      .filter((l) => l.trim() && !l.startsWith("#"));
    console.log(`      → ${lines.length} environment variables found`);
    const enabledProviders = lines.find((l) =>
      l.startsWith("ENABLED_PROVIDERS"),
    );
    if (enabledProviders) {
      console.log(`      → ${enabledProviders}`);
    }
  }
});

console.log("\n" + "=".repeat(60));
console.log("✅ Path debugging complete!\n");
