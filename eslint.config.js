import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: [".readme-examples/", "dist/", "site/", "node_modules/", "test-results/", "playwright-report/"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  { files: ["e2e/**/*.mjs", "playwright.config.mjs"], languageOptions: { globals: { console: "readonly", URL: "readonly", document: "readonly", window: "readonly", location: "readonly", getComputedStyle: "readonly" } } },
  { files: ["scripts/**/*.mjs"], languageOptions: { globals: { console: "readonly", URL: "readonly", document: "readonly", process: "readonly", Buffer: "readonly" } } },
  { files: ["scripts/readme-pictures.mjs"], languageOptions: { globals: { console: "readonly", process: "readonly", URL: "readonly", document: "readonly", window: "readonly", getComputedStyle: "readonly" } } },
  { files: ["demo/**/*.js"], languageOptions: { globals: { document: "readonly", window: "readonly", location: "readonly", history: "readonly", navigator: "readonly", URLSearchParams: "readonly", Intl: "readonly", setInterval: "readonly", setTimeout: "readonly", HTMLElement: "readonly", RegExp: "readonly", familyLanguage: "readonly" } } },
  { files: ["scripts/readme-pictures.mjs", "scripts/readme-pictures-lib.mjs"], languageOptions: { globals: { console: "readonly", process: "readonly", window: "readonly", document: "readonly", localStorage: "readonly", getComputedStyle: "readonly", URL: "readonly" } } },
);
