---
description: Create a Graphite stacked diff AND submit as PR in one step
allowed-tools: Bash(gt:*), Bash(git:*), Read
---

# Create Diff and Submit PR (All-in-One)

Create a new stacked diff from current changes AND submit it as a pull request in one command.

## Steps

This command combines `/gt-create` and `/gt-submit` into a single workflow.

1. **Validate environment** (same as gt-create):
   - Check if in a git repository (run `git rev-parse --is-inside-work-tree`)
   - Check if gt CLI is available (run `gt --version`)
   - If gt not found, show error: "Graphite CLI not found. Install with: `npm install -g @withgraphite/graphite-cli@latest`"

2. **Read settings (optional)**:
   - Try to read `.claude/gt-workflow.local.md` from current directory
   - If file exists, parse YAML frontmatter to get settings
   - If file not found, use defaults:
     - `commit_style`: `conventional`
     - `auto_submit`: `always`
     - `tool_preference`: `cli`
     - `dry_run`: `false`
   - Settings are optional - plugin works out-of-the-box with sensible defaults

3. **Check for changes** (same as gt-create):
   - Run `git status --short` to check for changes
   - If no changes, show: "No changes to commit. Make some changes first." and exit
   - Run `git diff --stat` to get summary

4. **Analyze changes and generate commit message** (same as gt-create):
   - Run `git diff --staged` and `git diff` to get all changes
   - Run `git log -5 --oneline` to see recent commit message style
   - Check for `.gitmessage` template
   - Generate commit message based on `commit_style` setting
   - Follow stacked diff conventions
   - Include Claude footer

5. **Create diff**:
   - If `dry_run` is true:
     - Show proposed commit message
     - Show files to be committed
     - Show commands that would run:
       ```
       gt create --all -m "<message>"
       gt submit
       ```
     - Show: "(Dry run mode - commands not executed)"
     - Exit (don't proceed to submit)
   - If `dry_run` is false:
     - Run `gt create --all -m "<commit_message>"`
     - Capture output and branch name

6. **Submit PR**:
   - Check `auto_submit` setting:
     - **always**: Proceed automatically
     - **prompt**: Skip (user should use `/gt-submit` manually)
     - **never**: Skip (user should use `/gt-submit` manually)
   - If proceeding with submit:
     - Run `gt submit` via Bash tool (current branch only)
     - Capture PR URL from output

7. **Show summary**:
   - Display commit message used
   - Show: "{X} files changed, {Y} insertions(+), {Z} deletions(-)"
   - Show branch name
   - If submitted:
     - Show: "✅ Diff created and PR submitted"
     - Show PR URL
   - If not submitted (auto_submit != always):
     - Show: "✅ Diff created (auto_submit: {setting})"
     - Show: "Run `/gt-submit` to open PR"

## Auto-Submit Behavior

The `auto_submit` setting controls whether this command actually submits:

- **always** (default): Creates diff AND submits PR automatically
- **prompt**: Creates diff, but you manually run `/gt-submit` when ready
- **never**: Creates diff only (effectively same as `/gt-create`)

This allows you to:
- Use `always` for confident one-shot workflows
- Use `prompt` to review changes before opening PR
- Use `never` to stack multiple diffs before submitting

## Error Handling

- **Not in git repo**: "Error: Not in a git repository. Navigate to a git repo first."
- **No changes**: "No changes to commit. Make some changes first."
- **gt not installed**: "Error: Graphite CLI not found. Install with: `npm install -g @withgraphite/graphite-cli@latest`"
- **Settings not found**: Show example settings file and exit
- **gt create fails**: Show error and don't proceed to submit
- **gt submit fails**: Show error with troubleshooting tip

## Example Output (with auto_submit: always)

```
📝 Commit message:
feat(auth): add password reset flow

Implement password reset via email with JWT tokens

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>

📊 Summary: 6 files changed, 203 insertions(+), 12 deletions(-)

✅ Diff created and PR submitted
Branch: feature/password-reset
PR URL: https://github.com/user/repo/pull/456
```

## Example Output (with auto_submit: prompt)

```
📝 Commit message:
fix(api): handle null values in user profile endpoint

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>

📊 Summary: 2 files changed, 15 insertions(+), 3 deletions(-)

✅ Diff created (auto_submit: prompt)
Branch: fix/api-null-handling

Run `/gt-submit` when ready to open PR
```

## Tips

- This is the fastest workflow when you're confident in your changes
- Set `auto_submit: prompt` if you want to review the diff in GitHub before opening PR
- Use `dry_run: true` to preview everything before executing
- Each run creates a new diff in your stack
