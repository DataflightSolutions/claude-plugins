---
description: Submit the current branch as a Graphite PR
allowed-tools: Bash(gt:*), Bash(git:*)
---

# Submit Current Branch as PR

Submit the current Git branch as a Graphite pull request.

## Steps

1. **Validate environment**:
   - Check if in a git repository (run `git rev-parse --is-inside-work-tree`)
   - Check if gt CLI is available (run `gt --version`)
   - If gt not found, show error: "Graphite CLI not found. Install with: `npm install -g @withgraphite/graphite-cli@latest`"

2. **Check current branch**:
   - Run `git branch --show-current` to get current branch name
   - If on `main` or `master`, show warning: "You're on trunk branch. Graphite PRs are typically created from feature branches."

3. **Submit PR**:
   - Run `gt submit` via Bash tool
   - Capture output showing PR URL

4. **Show success message**:
   - Display: "✅ PR submitted for branch: {branch_name}"
   - Show PR URL if available in output
   - Show submission status

## Error Handling

- **Not in git repo**: "Error: Not in a git repository. Navigate to a git repo first."
- **gt not installed**: "Error: Graphite CLI not found. Install with: `npm install -g @withgraphite/graphite-cli@latest`"
- **gt command fails**: Show gt error output with troubleshooting tip

## Example Output

```
✅ PR submitted for branch: feature/add-authentication

PR URL: https://github.com/user/repo/pull/123
Status: Open
```
