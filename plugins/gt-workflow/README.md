# gt-workflow

Automate Graphite (gt) stacked-PR workflow with one-shot commands for creating diffs and submitting PRs.

## Overview

This plugin streamlines your Graphite workflow by automating the repetitive steps of creating stacked diffs and opening pull requests. Instead of manually running `git status`, `gt create`, and `gt submit`, use simple slash commands that handle everything automatically.

## Features

- **One-shot workflows**: Create diffs and submit PRs with a single command
- **Smart commit messages**: AI-generated messages following your repo's style and stacked diff conventions
- **Automatic staging**: Handles unstaged changes with `--all` flag
- **CLI-first approach**: Uses `gt` CLI by default, falls back to Graphite MCP when needed
- **Configurable behavior**: Control commit style, auto-submit, and tool preferences

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
- **Configuration file** (optional): Customize behavior with `.claude/gt-workflow.local.md` (see below)

## Configuration (Optional)

The plugin works out-of-the-box with sensible defaults. Optionally customize behavior by creating `.claude/gt-workflow.local.md` in your project root:

```markdown
---
commit_style: conventional  # Default
auto_submit: always         # Default
dry_run: false              # Default
tool_preference: cli        # Default
---

# Graphite Workflow Settings

This file configures the gt-workflow plugin for this project.
```

**If no settings file exists, the plugin uses the defaults shown above.**

### Settings Reference

| Setting | Options | Default | Description |
|---------|---------|---------|-------------|
| `commit_style` | `conventional`, `freeform` | `conventional` | Commit message format style |
| `auto_submit` | `always`, `prompt`, `never` | `always` | Whether `/gt-create-submit` auto-submits |
| `dry_run` | `true`, `false` | `false` | Preview commands before executing |
| `tool_preference` | `cli`, `mcp`, `auto` | `cli` | Prefer gt CLI or Graphite MCP tools |

**Note**: Settings are optional. If no settings file exists, defaults are used automatically.

## Installation

### Local Installation

```bash
# Plugin is already in ~/.claude/plugins/gt-workflow/
# Enable it in Claude Code settings or use:
cc --plugin-dir ~/.claude/plugins/gt-workflow
```

### Project-Specific Setup

1. Copy plugin to project: `cp -r ~/.claude/plugins/gt-workflow .claude-plugin/`
2. Create settings file: `.claude/gt-workflow.local.md`
3. Restart Claude Code

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

### "Settings file not found"
Create `.claude/gt-workflow.local.md` in your project root (see Configuration section above).

### "Not in a git repository"
Navigate to a git repository before running commands.

### "No changes to commit"
Make some changes first, or check `git status` to see current state.

## How It Works

The plugin intelligently handles your workflow:

1. **Detects tool availability**: Checks for `gt` CLI or Graphite MCP
2. **Reads your settings**: Loads preferences from `.claude/gt-workflow.local.md`
3. **Analyzes changes**: Reviews git diff and commit history
4. **Generates commit message**: AI creates message following your repo's style
5. **Creates diff**: Runs `gt create --all` with generated message
6. **Submits PR** (if requested): Runs `gt submit` for current branch

## Development

- **Version**: 0.1.0
- **Components**: 3 commands, 3 helper scripts
- **Dependencies**: Graphite CLI (`gt`), optional Graphite MCP

## License

MIT
