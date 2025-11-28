---
description: Create a new Graphite stacked diff from current changes (alias for gt-create)
allowed-tools: Bash(gt:*), Bash(git:*)
---

# Create Graphite Stacked Diff

This is an alias for `/gt-create`. See that command for full documentation.

Create a new stacked diff from current changes with an AI-generated commit message.

## Steps

1. **Validate environment**:
   - Check if in a git repository (run `git rev-parse --is-inside-work-tree`)
   - Check if gt CLI is available (run `gt --version`)
   - If gt not found, show error: "Graphite CLI not found. Install with: `npm install -g @withgraphite/graphite-cli@latest`"

2. **Check for changes**:
   - Run `git status --short` to check for changes
   - If no changes, show: "No changes to commit. Make some changes first." and exit
   - Run `git diff --stat` to get summary (files changed, insertions, deletions)

3. **Analyze changes**:
   - Run `git diff --staged` and `git diff` to get all changes (staged + unstaged)
   - Run `git log -5 --oneline` to see recent commit message style

4. **Generate commit message**:
   - Analyze the diff to understand what changed
   - Use conventional commit format: `type(scope): description`
   - Determine type (feat/fix/refactor/docs/test/chore) from changes
   - Follow stacked diff conventions (concise, focused on single logical change)
   - Match existing commit style from git log
   - Keep message concise (50-72 char subject line)
   - Add body if needed for complex changes
   - Add footer:
     ```

     🤖 Generated with [Claude Code](https://claude.com/claude-code)

     Co-Authored-By: Claude Code
     ```

5. **Create diff**:
   - Run `gt create --all -m "<commit_message>"` via Bash tool
   - The `--all` flag stages all changes automatically
   - Capture output

6. **Show summary**:
   - Display commit message used
   - Show summary: "{X} files changed, {Y} insertions(+), {Z} deletions(-)"
   - Show branch name created/updated
   - Show: "✅ Diff created successfully"
