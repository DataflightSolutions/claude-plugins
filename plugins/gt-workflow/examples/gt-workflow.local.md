---
commit_style: conventional
auto_submit: always
dry_run: false
tool_preference: cli
---

# Graphite Workflow Settings

This file configures the gt-workflow plugin for this project.

## Settings Explained

- **commit_style**: `conventional` uses conventional commit format (feat:, fix:, etc.), `freeform` uses natural language
- **auto_submit**: `always` automatically submits PRs with `/gt-create-submit`, `prompt` asks first, `never` only creates diffs
- **dry_run**: `true` shows preview before executing, `false` executes immediately
- **tool_preference**: `cli` prefers `gt` CLI commands, `mcp` prefers Graphite MCP tools, `auto` intelligently chooses

## Usage

Copy this file to `.claude/gt-workflow.local.md` in your project root and customize as needed.
