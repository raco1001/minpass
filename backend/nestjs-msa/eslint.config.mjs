// @ts-check
import eslint from "@eslint/js";
import tseslint from "typescript-eslint"; // flat presets
import prettierRecommended from "eslint-plugin-prettier/recommended";
import importPlugin from "eslint-plugin-import";
import globals from "globals";
import { defineConfig } from "@eslint/config-helpers";
import path from "node:path";

const r = (...p) => path.resolve(process.cwd(), ...p);

export default defineConfig(
  {
    ignores: [
      "eslint.config.mjs",
      "node_modules",
      "dist",
      "coverage",
      "**/*.d.ts",
    ],
  },

  eslint.configs.recommended,

  ...tseslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,

  prettierRecommended,

  {
    plugins: { import: importPlugin },
    settings: {
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: [r("tsconfig.json")],
        },
        node: { extensions: [".js", ".ts", ".json"] },
      },
    },
    languageOptions: {
      globals: { ...globals.node, ...globals.jest },
      ecmaVersion: "latest",
      sourceType: "module",
    },
    rules: {
      quotes: ["error", "double", { avoidEscape: true }],
      semi: ["error", "always"],
      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
          ],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],

      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-floating-promises": "warn",
      "@typescript-eslint/no-unsafe-argument": "warn",
      "@typescript-eslint/no-unsafe-assignment": "warn",
      "@typescript-eslint/no-unsafe-call": "warn",
      "@typescript-eslint/no-unsafe-member-access": "warn",
    },
  },

  {
    files: ["apps/apis/**/*.{ts,tsx}"],
    settings: {
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: [r("apps/apis/tsconfig.app.json"), r("tsconfig.json")],
        },
      },
    },
  },
  {
    files: ["apps/users/**/*.{ts,tsx}"],
    settings: {
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: [r("apps/users/tsconfig.app.json"), r("tsconfig.json")],
        },
      },
    },
  },
);
