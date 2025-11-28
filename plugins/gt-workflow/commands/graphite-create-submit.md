---
description: Create a Graphite stacked diff and submit as PR in one step (alias for gt-create-submit)
allowed-tools: Bash(gt:*), Bash(git:*)
---

# Create Diff and Submit PR

This command is an alias for `/gt-create-submit`. Follow the same execution steps.

## Quick Reference

1. Validate: `git rev-parse --is-inside-work-tree` and `gt --version`
2. Check changes: `git status --short` and `git diff --stat`
3. Analyze: `git diff`, `git diff --staged`, `git log -5 --oneline`
4. Generate commit message (conventional format, include `Co-Authored-By: Claude Code` footer)
5. Create: `gt create --all -m "<message>"`
6. Submit: `gt submit`
7. Report branch name, changes summary, and PR URL

## Commit Message Format

```
type(scope): description

Optional body explaining what and why.

Co-Authored-By: Claude Code
```

Each diff should represent one atomic, logical change.

If gt create fails, do not proceed to gt submit.
