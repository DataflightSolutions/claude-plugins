# gt-workflow

Automate Graphite stacked diff workflows with slash commands for creating diffs and submitting PRs.

## Overview

This plugin provides commands that wrap the Graphite CLI (`gt`) to streamline the stacked diff workflow. Instead of manually running git and gt commands, use these slash commands to create diffs and submit pull requests.

## Stacked Diff Philosophy

The commands in this plugin follow stacked diff best practices:

- **One logical change per diff**: Each diff should represent a single, atomic change that can be reviewed and landed independently.
- **Clear commit messages**: Conventional commit format with descriptive messages that explain what and why.
- **Incremental building**: Stack multiple small diffs rather than one large change.

## Commands

### `/gt-create`

Create a new stacked diff from current changes without submitting a PR.

**Alias**: `/graphite-create`

**What it does**:
1. Validates git repository and gt CLI availability
2. Analyzes current changes (staged and unstaged)
3. Generates a conventional commit message
4. Runs `gt create --all -m "<message>"`

**Use when**: You want to create a diff but review it before opening a PR, or when building a stack of multiple diffs.

### `/gt-submit`

Submit the current branch as a pull request.

**Alias**: `/graphite-submit`

**What it does**:
1. Validates environment
2. Runs `gt submit` to push and create/update the PR

**Use when**: You have a diff ready and want to open or update a PR.

### `/gt-create-submit`

Create a diff and submit it as a PR in one step.

**Alias**: `/graphite-create-submit`

**What it does**:
1. Everything from `/gt-create`
2. Immediately runs `/gt-submit`

**Use when**: You have a complete, self-contained change ready for review.

## Commit Message Format

All commands generate commit messages following this format:

```
type(scope): short description

Optional longer explanation of what changed and why.

Co-Authored-By: Claude Code
```

**Types**: feat, fix, refactor, docs, test, chore, perf, style, build, ci

**Examples**:
```
feat(auth): add JWT token refresh endpoint

fix(api): handle null response from external service

refactor(utils): extract date formatting into separate module
```

## Prerequisites

- **Graphite CLI**: `npm install -g @withgraphite/graphite-cli@latest`
- **Git repository**: Must be in an initialized git repo
- **Graphite setup**: Run `gt init` in your repository if not already configured

## Workflow Examples

### Building a stack incrementally

```
# Make first change
/gt-create          # Creates diff 1

# Make second change on top
/gt-create          # Creates diff 2, stacked on diff 1

# Make third change
/gt-create          # Creates diff 3

# Submit all when ready
gt submit --stack   # (run manually to submit entire stack)
```

### Quick single-diff workflow

```
# Make your changes
/gt-create-submit   # Creates diff and opens PR immediately
```

### Review before submitting

```
# Make changes
/gt-create          # Creates the diff

# Review in GitHub or locally
# Make adjustments if needed

/gt-submit          # Submit when satisfied
```

## Troubleshooting

**"Graphite CLI not found"**

Install the CLI:
```bash
npm install -g @withgraphite/graphite-cli@latest
```

**"Not in a git repository"**

Navigate to a git repository before running commands.

**"Not authenticated"**

Run `gt auth` to authenticate with GitHub.

**"Branch not tracked by Graphite"**

The branch was created outside of gt. Use `gt create` to create Graphite-tracked branches.

## Development

- **Version**: 0.1.0
- **Commands**: 6 (3 primary + 3 aliases)
- **Dependencies**: Graphite CLI

## License

MIT
