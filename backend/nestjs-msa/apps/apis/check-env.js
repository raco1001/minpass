#!/usr/bin/env node

/**
 * Environment Variables Checker for OAuth Configuration
 *
 * Run this script to verify your OAuth setup:
 * node apps/apis/check-env.js
 */

require("dotenv").config({ path: "./apps/apis/.env" });

const requiredVars = {
  common: ["ENABLED_PROVIDERS", "REDIRECT_BASE_URL"],
  google: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
  github: ["GITHUB_CLIENT_ID", "GITHUB_CLIENT_SECRET"],
  kakao: ["KAKAO_CLIENT_ID", "KAKAO_CLIENT_SECRET"],
};

console.log("🔍 Checking OAuth Environment Variables...\n");

// Check common variables
console.log("📋 Common Variables:");
requiredVars.common.forEach((key) => {
  const value = process.env[key];
  if (value) {
    console.log(`  ✅ ${key}: ${value}`);
  } else {
    console.log(`  ❌ ${key}: NOT SET`);
  }
});

console.log("");

// Check enabled providers
const enabledProviders = (process.env.ENABLED_PROVIDERS || "")
  .split(",")
  .map((p) => p.trim().toLowerCase())
  .filter(Boolean);

console.log(`🔧 Enabled Providers: ${enabledProviders.join(", ") || "NONE"}\n`);

// Check provider-specific variables
enabledProviders.forEach((provider) => {
  if (requiredVars[provider]) {
    console.log(`📦 ${provider.toUpperCase()} OAuth Variables:`);
    requiredVars[provider].forEach((key) => {
      const value = process.env[key];
      if (value) {
        // Mask sensitive data
        const maskedValue = key.includes("SECRET")
          ? value.substring(0, 4) + "***"
          : value;
        console.log(`  ✅ ${key}: ${maskedValue}`);
      } else {
        console.log(`  ❌ ${key}: NOT SET`);
      }
    });
    console.log("");
  }
});

// Summary
const allRequired = [
  ...requiredVars.common,
  ...enabledProviders.flatMap((p) => requiredVars[p] || []),
];

const missingVars = allRequired.filter((key) => !process.env[key]);

console.log("=".repeat(50));
if (missingVars.length === 0) {
  console.log("✅ All required environment variables are set!");
} else {
  console.log("❌ Missing environment variables:");
  missingVars.forEach((key) => console.log(`   - ${key}`));
  console.log("\n💡 Please add these to apps/apis/.env file");
  process.exit(1);
}
