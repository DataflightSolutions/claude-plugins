---
description: Create a Graphite stacked diff and submit as PR in one step
allowed-tools: Bash(gt:*), Bash(git:*)
---

# Create Diff and Submit PR

Create a stacked diff from current changes and immediately submit it as a pull request. This combines `/gt-create` and `/gt-submit` into a single workflow.

## When to Use This Command

Use this command when:
- You have a complete, self-contained change ready for review
- You want to create and submit a PR in one step
- The change represents a single logical unit of work

For iterative work where you want to create multiple diffs before submitting, use `/gt-create` instead.

## Stacked Diff Philosophy

Each diff should represent exactly one logical change. Before creating the diff, consider:
- Is this a single, atomic change?
- Could this be reviewed independently?
- Does it have a clear, focused purpose?

If the changes span multiple unrelated concerns, consider splitting them into separate diffs.

## Execution Steps

Execute these steps in order. Stop and report errors if any step fails.

### Step 1: Validate Environment

```bash
git rev-parse --is-inside-work-tree
```

If this fails, tell the user: "Not in a git repository. Navigate to a git repo first."

```bash
gt --version
```

If this fails, tell the user: "Graphite CLI not found. Install with: npm install -g @withgraphite/graphite-cli@latest"

### Step 2: Check for Changes

```bash
git status --short
```

If output is empty, tell the user: "No changes to commit." and stop.

```bash
git diff --stat
```

Note the files changed count and line changes for the summary.

### Step 3: Analyze Changes for Commit Message

```bash
git diff
git diff --staged
git log -5 --oneline
```

### Step 4: Generate Commit Message

Write a commit message following these rules:

**Subject line:**
- Format: `type(scope): description`
- Types: feat, fix, refactor, docs, test, chore, perf, style, build, ci
- Keep under 72 characters
- Use imperative mood
- No period at the end

**Body (if needed):**
- Explain what and why
- Wrap at 72 characters

**Footer (required):**
```
Co-Authored-By: Claude Code
```

### Step 5: Create the Diff

```bash
gt create --all -m "<commit_message>"
```

If this fails, show the error and stop. Do not proceed to submit.

### Step 6: Submit the PR

```bash
gt submit
```

This pushes the branch and creates the pull request.

### Step 7: Report Results

After successful completion, report:
- The commit message
- Number of files changed and lines modified
- The branch name
- The PR URL

Example output format:
```
Diff created and PR submitted.

Branch: feature/auth-token-handling
Commit: fix(auth): handle expired JWT tokens gracefully
Changes: 3 files, +45 -12

PR URL: https://github.com/user/repo/pull/123
```

## Error Handling

**If gt create fails:**
- Show the exact error
- Do not proceed to gt submit
- Common causes: not on valid base branch, conflicts

**If gt submit fails:**
- The diff was created but not submitted
- Show the error
- User can retry with `/gt-submit`
- Common causes: auth issues, network problems

## Notes

- This is a convenience command combining two operations
- If you need to review the diff before submitting, use `/gt-create` then `/gt-submit` separately
- The PR title and description are derived from the commit message
