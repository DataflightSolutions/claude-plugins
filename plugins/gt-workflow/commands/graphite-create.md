---
description: Create a new Graphite stacked diff from current changes (alias for gt-create)
allowed-tools: Bash(gt:*), Bash(git:*), Read
---

# Create Graphite Stacked Diff

This is an alias for `/gt-create`. See that command for full documentation.

Create a new stacked diff from current changes with an AI-generated commit message.

## Steps

1. **Validate environment**:
   - Check if in a git repository (run `git rev-parse --is-inside-work-tree`)
   - Check if gt CLI is available (run `gt --version`)
   - If gt not found, show error: "Graphite CLI not found. Install with: `npm install -g @withgraphite/graphite-cli@latest`"

2. **Read settings (optional)**:
   - Try to read `.claude/gt-workflow.local.md` from current directory
   - If file exists, parse YAML frontmatter to get settings
   - If file not found, use defaults:
     - `commit_style`: `conventional`
     - `tool_preference`: `cli`
     - `dry_run`: `false`
   - Settings are optional - plugin works out-of-the-box with sensible defaults

3. **Check for changes**:
   - Run `git status --short` to check for changes
   - If no changes, show: "No changes to commit. Make some changes first." and exit
   - Run `git diff --stat` to get summary (files changed, insertions, deletions)

4. **Analyze changes**:
   - Run `git diff --staged` and `git diff` to get all changes (staged + unstaged)
   - Run `git log -5 --oneline` to see recent commit message style
   - If `.gitmessage` template exists, read it with Read tool

5. **Generate commit message**:
   - Analyze the diff to understand what changed
   - Based on `commit_style`:
     - **conventional**: Determine type (feat/fix/refactor/docs/test/chore) from changes, format as `type(scope): description`
     - **freeform**: Write natural language summary
   - Follow stacked diff conventions (concise, focused on single logical change)
   - Match existing commit style from git log
   - Keep message concise (50-72 char subject line)
   - Add body if needed for complex changes
   - Add footer:
     ```

     🤖 Generated with [Claude Code](https://claude.com/claude-code)

     Co-Authored-By: Claude <noreply@anthropic.com>
     ```

6. **Create diff**:
   - If `dry_run` is true:
     - Show proposed commit message
     - Show files to be committed
     - Show command: `gt create --all -m "<message>"`
     - Note: "(Dry run mode - command not executed)"
   - If `dry_run` is false:
     - Run `gt create --all -m "<commit_message>"` via Bash tool
     - The `--all` flag stages all changes automatically
     - Capture output

7. **Show summary**:
   - Display commit message used
   - Show summary: "{X} files changed, {Y} insertions(+), {Z} deletions(-)"
   - Show branch name created/updated
   - Show: "✅ Diff created successfully"
