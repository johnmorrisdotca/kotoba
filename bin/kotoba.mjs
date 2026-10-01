#!/usr/bin/env node
// The command line: `kotoba`. All of it is `runCli`, a function in the
// package; these lines hand it the real process.
import process from "node:process";

import { runCli } from "../dist/cli.js";

const result = await runCli(process.argv.slice(2), { env: process.env, locale: Intl.DateTimeFormat().resolvedOptions().locale });
if (result.out !== "") process.stdout.write(result.out);
if (result.err !== "") process.stderr.write(result.err);
process.exitCode = result.code;
