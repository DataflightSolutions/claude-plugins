# DataFlight Claude Code Plugins

Official Claude Code plugins for DataFlight workflows.

## Plugins

### graphite

Automate Graphite stacked-PR workflow with one-shot commands for creating diffs and submitting PRs.

**Commands:**
- `/graphite:create` - Create a stacked diff from current changes
- `/graphite:submit` - Submit current branch as PR
- `/graphite:create-submit` - Create and submit in one step
- Aliases: `/graphite:gt-create`, `/graphite:gt-submit`, `/graphite:gt-create-submit`

**Features:**
- AI-generated commit messages following your repo's style
- Automatic staging with `--all` flag
- CLI-first approach

[View full documentation →](./plugins/graphite/README.md)

### playwright

Browser automation with Playwright.

**Commands:**
- `/playwright:screenshot` - Take a screenshot of a webpage
- `/playwright:check-links` - Check for broken links
- `/playwright:test-page` - Basic page health check
- `/playwright:test-responsive` - Test across viewports

**Features:**
- Auto-detects running dev servers
- Scripts saved to `/tmp` for inspection
- Visible browser for debugging

[View full documentation →](./plugins/playwright/README.md)

## Installation

### From Marketplace (Coming Soon)

```bash
claude plugin install graphite@dataflight-claude-plugins
claude plugin install playwright@dataflight-claude-plugins
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
