---
description: Create a new Graphite stacked diff from current changes (alias for gt-create)
allowed-tools: Bash(gt:*), Bash(git:*)
---

# Create Graphite Stacked Diff

This command is an alias for `/gt-create`. Follow the same execution steps.

## Quick Reference

1. Validate: `git rev-parse --is-inside-work-tree` and `gt --version`
2. Check changes: `git status --short` and `git diff --stat`
3. Analyze: `git diff`, `git diff --staged`, `git log -5 --oneline`
4. Generate commit message (conventional format, include `Co-Authored-By: Claude Code` footer)
5. Create: `gt create --all -m "<message>"`
6. Report branch name and changes summary

## Commit Message Format

```
type(scope): description

Optional body explaining what and why.

Co-Authored-By: Claude Code
```

Types: feat, fix, refactor, docs, test, chore, perf, style, build, ci

Each diff should represent one atomic, logical change.
