#!/bin/bash
# Quick source file for Zed terminal aliases
# Usage: source .zed/aliases.sh

# Navigate to blog directory
cd /Users/szymondzumak/Developer/dev-hub/blog

# Development aliases
alias dev='deno task dev'
alias build='deno task build'
alias test='deno task test'
alias check='deno task check-all'
alias lint='deno task lint'
alias format='deno task format'

# Git shortcuts
alias gs='git status'
alias gd='git diff'
alias gl='git log --oneline -10'
alias ga='git add'
alias gc='git commit -m'
alias gp='git push'

# Agent helpers
alias acp-logs='echo "💡 Use: dev: open acp logs in Zed command palette"'
alias agent-status='ps aux | grep -E "(claude|agent)" | grep -v grep'
alias tasks='cat deno.json | jq .tasks'

# Quick navigation
alias blog='cd /Users/szymondzumak/Developer/dev-hub/blog'
alias root='cd /Users/szymondzumak/Developer/dev-hub'

echo "🤖 Aliases loaded! Try: dev, test, check, build, acp-logs"