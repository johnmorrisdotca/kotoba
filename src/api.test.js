// The API reference (made by scripts/api.mjs, published as api.html) checked against the source it is made from.
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { apiMarkdown, apiOf } from "../scripts/api.mjs";

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const entries = Object.entries(pkg.exports).filter(([key, entry]) => !key.includes("*") && String(entry.default).startsWith("./dist/"));
const source = (entry) => ["ts", "tsx"].map((ext) => resolve(entry.default.replace("./dist/", "src/").replace(/\.js$/, `.${ext}`))).find((file) => existsSync(file));

describe("the API reference", () => {
  const api = apiOf();

  it("has a section for every entry point in package.json, and no other", () => {
    expect(api.map((entry) => entry.entry).sort()).toEqual(entries.map(([key]) => key).sort());
  });

  it("lists every name each entry point really exports", async () => {
    for (const [key, entry] of entries) {
      const module = await import(/* @vite-ignore */ source(entry));
      const listed = api.find((one) => one.entry === key).exports.map((one) => one.name);
      for (const name of Object.keys(module)) expect(listed, `${key} exports ${name}`).toContain(name);
    }
  });

  it("gives every export a kind and a signature", () => {
    for (const entry of api) for (const one of entry.exports) {
      expect(["function", "type", "const", "namespace"], `${entry.entry} ${one.name}`).toContain(one.kind);
      expect(one.signature.length, `${entry.entry} ${one.name}`).toBeGreaterThan(0);
    }
  });

  it("is docs/api.md, which is what `pnpm docs:api` writes: run it after changing an export or a doc comment", () => {
    expect(readFileSync("docs/api.md", "utf8")).toBe(apiMarkdown(api));
  });

  it("is linked from the README", () => {
    expect(readFileSync("README.md", "utf8")).toContain(`https://github.com/johnmorrisdotca/${pkg.name.split("/")[1]}/blob/main/docs/api.md`);
  });
});
