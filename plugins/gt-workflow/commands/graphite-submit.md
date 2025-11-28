---
description: Submit the current branch as a Graphite PR (alias for gt-submit)
allowed-tools: Bash(gt:*), Bash(git:*)
---

# Submit Current Branch as PR

This command is an alias for `/gt-submit`. Follow the same execution steps.

## Quick Reference

1. Validate: `git rev-parse --is-inside-work-tree` and `gt --version`
2. Check branch: `git branch --show-current` (warn if on main/master)
3. Submit: `gt submit`
4. Report the PR URL

## Notes

- Submits only the current branch, not the entire stack
- PR title and description come from the commit message
- Subsequent runs update the existing PR
