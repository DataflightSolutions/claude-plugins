---
description: Submit the current branch as a Graphite PR
allowed-tools: Bash(gt:*), Bash(git:*)
---

# Submit Current Branch as PR

Submit the current stacked diff branch as a pull request using the Graphite CLI.

## What This Command Does

This command runs `gt submit` which:
- Creates or updates a pull request for the current branch
- Sets up the PR with the correct base branch (the parent in the stack)
- Links the PR to the Graphite stack for easy navigation

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

### Step 2: Check Current Branch

```bash
git branch --show-current
```

If the branch is `main` or `master`, warn the user: "You are on the trunk branch. PRs are typically submitted from feature branches created with gt create."

### Step 3: Submit the PR

```bash
gt submit
```

This command will:
- Push the branch to the remote
- Create a pull request (or update existing one)
- Output the PR URL

### Step 4: Report Results

After successful submission, report:
- The branch name that was submitted
- The PR URL from the gt output
- Confirmation that the PR is ready for review

Example output format:
```
PR submitted for branch: feature/auth-token-handling

PR URL: https://github.com/user/repo/pull/123

The pull request is now open and ready for review.
```

## Error Handling

If `gt submit` fails:
- Show the exact error output from gt
- Common issues:
  - Not authenticated with GitHub (run `gt auth`)
  - Branch not tracked by Graphite (use `gt create` first)
  - Remote push rejected (may need to pull or rebase)

## Notes

- This submits only the current branch, not the entire stack
- To submit all branches in a stack, the user should run `gt submit --stack` manually
- The PR description and title come from the commit message
- Subsequent runs of `gt submit` on the same branch update the existing PR
