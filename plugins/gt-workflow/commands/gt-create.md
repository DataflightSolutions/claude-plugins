---
description: Create a new Graphite stacked diff from current changes
allowed-tools: Bash(gt:*), Bash(git:*)
---

# Create Graphite Stacked Diff

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

## Commit Message Example

```
feat(auth): add JWT token validation

Implement middleware to validate JWT tokens on protected routes.
Includes error handling for expired and malformed tokens.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Code
```

## Error Handling

- **Not in git repo**: "Error: Not in a git repository. Navigate to a git repo first."
- **No changes**: "No changes to commit. Make some changes first."
- **gt not installed**: "Error: Graphite CLI not found. Install with: `npm install -g @withgraphite/graphite-cli@latest`"
- **gt command fails**: Show gt error output with troubleshooting tip

## Example Output

```
📝 Commit message:
feat(pipeline): add flat list view for pipeline results

Implemented new PipelineFlatList component with tag-based display

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Code

📊 Summary: 4 files changed, 127 insertions(+), 3 deletions(-)

✅ Diff created successfully
Branch: feature/pipeline-flat-list
```

## Tips

- The `--all` flag automatically stages unstaged changes
- Each diff should represent one logical change for easier review
- Stack multiple diffs by running this command multiple times
- Use `/gt-submit` separately to control when PRs are opened
