# gt-workflow

Automate Graphite (gt) stacked-PR workflow with one-shot commands for creating diffs and submitting PRs.

## Overview

This plugin streamlines your Graphite workflow by automating the repetitive steps of creating stacked diffs and opening pull requests. Instead of manually running `git status`, `gt create`, and `gt submit`, use simple slash commands that handle everything automatically.

## Features

- **One-shot workflows**: Create diffs and submit PRs with a single command
- **Smart commit messages**: AI-generated messages following your repo's style and stacked diff conventions
- **Automatic staging**: Handles unstaged changes with `--all` flag
- **Zero configuration**: Works out of the box with sensible defaults

## Commands

### `/gt-create` (alias: `/graphite-create`)
Create a new stacked diff from current changes without submitting.

**What it does**:
1. Checks for changes in working directory
2. Auto-stages unstaged changes
3. Generates commit message analyzing diff and git log
4. Runs `gt create --all -m "<message>"`

**Output**: Summary of files changed, lines modified, and commit message

### `/gt-submit` (alias: `/graphite-submit`)
Submit the current branch as a PR.

**What it does**:
1. Validates current branch
2. Runs `gt submit` for current branch only

**Output**: PR URL and submission status

### `/gt-create-submit` (alias: `/graphite-create-submit`)
Create a stacked diff AND submit as PR in one step.

**What it does**:
1. Everything from `/gt-create`
2. Automatically runs `/gt-submit`

**Output**: Summary of changes and PR URL

## Prerequisites

- **Graphite CLI**: Install with `npm install -g @withgraphite/graphite-cli@latest`
- **Git repository**: Must be in a git repo with Graphite initialized

## Usage Examples

### Quick iteration workflow
```
# Make code changes...
/gt-create              # Create diff, don't submit yet
# Make more changes on top...
/gt-create              # Create another diff in the stack
# Review your stack...
/gt-submit              # Submit current branch as PR
```

### One-shot workflow
```
# Make code changes...
/gt-create-submit       # Create diff AND submit PR immediately
```

### Submit entire stack
```
# After creating multiple diffs...
/gt-submit              # Submit current branch only
# Or manually run: gt submit --stack
```

## Troubleshooting

### "gt command not found"
Install Graphite CLI:
```bash
npm install -g @withgraphite/graphite-cli@latest
```

### "Not in a git repository"
Navigate to a git repository before running commands.

### "No changes to commit"
Make some changes first, or check `git status` to see current state.

## How It Works

The plugin intelligently handles your workflow:

1. **Detects tool availability**: Checks for `gt` CLI
2. **Analyzes changes**: Reviews git diff and commit history
3. **Generates commit message**: AI creates message following your repo's style
4. **Creates diff**: Runs `gt create --all` with generated message
5. **Submits PR** (if requested): Runs `gt submit` for current branch

## Development

- **Version**: 0.1.0
- **Components**: 6 commands (3 primary + 3 aliases)
- **Dependencies**: Graphite CLI (`gt`)

## License

MIT
