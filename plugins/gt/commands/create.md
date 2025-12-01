---
description: Create a new Graphite stacked diff from current changes (alias for /graphite:create)
allowed-tools: Bash(gt:*), Bash(git:*)
---

# Create Graphite Stacked Diff

This is an alias for `/graphite:create`. Follow the same execution steps.

See the full documentation in the graphite plugin.

## Quick Reference

1. Validate environment (git repo + gt CLI)
2. Check for changes (`git status --short`)
3. Analyze changes (`git diff`, `git diff --staged`, `git log -5 --oneline`)
4. Generate conventional commit message
5. Run `gt create --all -m "<commit_message>"`
6. Report results (branch name, commit message, files changed)

Use `/graphite:submit` or `/gt:submit` when ready to open a PR.
