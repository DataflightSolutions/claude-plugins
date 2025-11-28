---
description: Create a Graphite stacked diff AND submit as PR in one step
allowed-tools: Bash(gt:*), Bash(git:*)
---

# Create Diff and Submit PR (All-in-One)

Create a new stacked diff from current changes AND submit it as a pull request in one command.

## Steps

This command combines `/gt-create` and `/gt-submit` into a single workflow.

1. **Validate environment** (same as gt-create):
   - Check if in a git repository (run `git rev-parse --is-inside-work-tree`)
   - Check if gt CLI is available (run `gt --version`)
   - If gt not found, show error: "Graphite CLI not found. Install with: `npm install -g @withgraphite/graphite-cli@latest`"

2. **Check for changes**:
   - Run `git status --short` to check for changes
   - If no changes, show: "No changes to commit. Make some changes first." and exit
   - Run `git diff --stat` to get summary

3. **Analyze changes and generate commit message**:
   - Run `git diff --staged` and `git diff` to get all changes
   - Run `git log -5 --oneline` to see recent commit message style
   - Use conventional commit format: `type(scope): description`
   - Follow stacked diff conventions
   - Include Claude footer

4. **Create diff**:
   - Run `gt create --all -m "<commit_message>"`
   - Capture output and branch name

5. **Submit PR**:
   - Run `gt submit` via Bash tool
   - Capture PR URL from output

6. **Show summary**:
   - Display commit message used
   - Show: "{X} files changed, {Y} insertions(+), {Z} deletions(-)"
   - Show branch name
   - Show: "✅ Diff created and PR submitted"
   - Show PR URL

## Error Handling

- **Not in git repo**: "Error: Not in a git repository. Navigate to a git repo first."
- **No changes**: "No changes to commit. Make some changes first."
- **gt not installed**: "Error: Graphite CLI not found. Install with: `npm install -g @withgraphite/graphite-cli@latest`"
- **gt create fails**: Show error and don't proceed to submit
- **gt submit fails**: Show error with troubleshooting tip

## Example Output

```
📝 Commit message:
feat(auth): add password reset flow

Implement password reset via email with JWT tokens

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Code

📊 Summary: 6 files changed, 203 insertions(+), 12 deletions(-)

✅ Diff created and PR submitted
Branch: feature/password-reset
PR URL: https://github.com/user/repo/pull/456
```

## Tips

- This is the fastest workflow when you're confident in your changes
- Each run creates a new diff in your stack
- Use `/gt-create` if you want to create diff without submitting PR
