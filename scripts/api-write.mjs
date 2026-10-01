// Writes docs/api.md, the API reference made from the source: `pnpm docs:api`. A test fails when the file is not what this writes.
import { writeFileSync } from "node:fs";

import { apiMarkdown } from "./api.mjs";

writeFileSync("docs/api.md", apiMarkdown());
console.log("docs/api.md is written.");
