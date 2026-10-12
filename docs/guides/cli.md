---
title: "CLI boundaries and host validation"
section: explanation
order: 7
description: "Use the async CLI result and native state rather than display claims."
---

## The async CLI is data

```ts
import {runCli} from "@johnmorrisdotca/kotoba/cli";
const result = await runCli(["mark","apple","alley"],{locale:"en-US"});
console.log(result.code,result.out.trim(),result.err);
```

`runCli` is asynchronous because commands may load a dictionary. It returns output, error and exit code rather than writing process streams. Codes 0, 1 and 2 distinguish success, refused requests and invalid usage. `npx @johnmorrisdotca/kotoba --help` lists the native word/check/mark/score/daily commands and options; pass a date and locale for repeatable automation.

## A trusted hidden word

Pure game state contains the hidden word. The native element and its events are meant for a trusted local host. For a competitive server, keep the answer and authoritative state on the server, validate submitted words there and send only the marks the client needs. Browser elapsed time alone is a host claim. Daily fairness depends on the pinned ordered list, not merely the package name. See [the command line](../../README.md#the-command-line) and [marking](marking.md).
