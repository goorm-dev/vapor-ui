---
'@vapor-ui/figma-blueprint': patch
---

figma-blueprint now sends a usage record for `@goorm.io` Figma accounts, and `DO_NOT_TRACK=1` (or `true`) turns it off. When such an account runs the CLI on a Figma URL without `--repo`, the record carries the file key, the node id, the package version and how the run ended (`ok`, `unscorable` or `error`, with the failed stage and Figma HTTP status for an error). It never carries the email, error messages or file paths, and other accounts send nothing. The record does not change the output or the exit code, and the CLI waits at most 1.5 seconds for it after the run. The token now needs the `current_user:read` scope for the account check, otherwise nothing is sent. The package README lists what is sent and when.
