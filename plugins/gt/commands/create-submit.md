---
description: Create a Graphite stacked diff and submit as PR in one step (alias for /graphite:create-submit)
allowed-tools: Bash(gt:*), Bash(git:*)
---

# Create Diff and Submit PR

This is an alias for `/graphite:create-submit`. Follow the same execution steps.

See the full documentation in the graphite plugin.

## Quick Reference

1. Validate environment (git repo + gt CLI)
2. Check for changes
3. Analyze and generate commit message
4. Run `gt create --all -m "<commit_message>"`
5. Run `gt submit`
6. Report results with PR URL

For iterative work, use `/graphite:create` or `/gt:create` instead.
