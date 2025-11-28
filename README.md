# DataFlight Claude Code Plugins

Official Claude Code plugins for DataFlight workflows.

## Plugins

### gt-workflow

Automate Graphite (gt) stacked-PR workflow with one-shot commands for creating diffs and submitting PRs.

**Commands:**
- `/gt-create` - Create a stacked diff from current changes
- `/gt-submit` - Submit current branch as PR
- `/gt-create-submit` - Create and submit in one step
- Aliases: `/graphite-create`, `/graphite-submit`, `/graphite-create-submit`

**Features:**
- AI-generated commit messages following your repo's style
- Automatic staging with `--all` flag
- CLI-first approach with MCP fallback
- Optional configuration via `.claude/gt-workflow.local.md`

[View full documentation →](./plugins/gt-workflow/README.md)

## Installation

### From Marketplace (Coming Soon)

```bash
claude plugin install gt-workflow@dataflight-claude-plugins
```

### From GitHub

```bash
# Clone the marketplace
cd ~/.claude/plugins/marketplaces
git clone https://github.com/dataflight/claude-plugins dataflight-claude-plugins

# Restart Claude Code
```

### Manual Installation

1. Clone this repository to `~/.claude/plugins/marketplaces/dataflight-claude-plugins`
2. Restart Claude Code
3. Plugins will be automatically available

## Development

To add a new plugin to this marketplace:

1. Create plugin directory in `plugins/`:
   ```bash
   mkdir -p plugins/my-plugin/.claude-plugin
   mkdir -p plugins/my-plugin/commands
   ```

2. Create `plugins/my-plugin/.claude-plugin/plugin.json`:
   ```json
   {
     "name": "my-plugin",
     "version": "0.1.0",
     "description": "Plugin description",
     "author": {
       "name": "Your Name"
     }
   }
   ```

3. Add commands as markdown files in `plugins/my-plugin/commands/`

4. Test locally, then commit and push

## Contributing

1. Fork this repository
2. Create a feature branch
3. Add or update plugins
4. Submit a pull request

## License

MIT

## Support

For issues or questions, open an issue on GitHub or contact the DataFlight team.
