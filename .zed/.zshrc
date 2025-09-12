# Source system zshrc first
[[ -f ~/.zshrc ]] && source ~/.zshrc

# Zed-specific shell configuration for agentic workflows
# This file is sourced in Zed terminals for enhanced AI agent integration

# Enhanced terminal settings for AI workflows
export HISTSIZE=10000
export SAVEHIST=10000
export HISTFILE=~/.zsh_history_zed

# Claude Code integration
export CLAUDE_CODE_HOME="/Users/szymondzumak/Developer/dev-hub"
export CLAUDE_CODE_CONFIG="/Users/szymondzumak/Developer/dev-hub/CLAUDE.md"

# Deno configuration
export DENO_DIR="$HOME/.cache/deno"
export DENO_INSTALL="$HOME/.deno"
[[ -d "$DENO_INSTALL/bin" ]] && export PATH="$DENO_INSTALL/bin:$PATH"

# Enhanced colors and output
export CLICOLOR=1
export LSCOLORS=ExFxBxDxCxegedabagacad

# Ensure we're in the blog directory
cd /Users/szymondzumak/Developer/dev-hub/blog

# Useful aliases for development
alias blog='cd /Users/szymondzumak/Developer/dev-hub/blog'
alias root='cd /Users/szymondzumak/Developer/dev-hub'
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

# Quick navigation
alias ..='cd ..'
alias ...='cd ../..'
alias ll='ls -la'
alias la='ls -la'

# Agent debugging helpers
alias acp-logs='echo "💡 Use: dev: open acp logs in Zed command palette"'
alias agent-status='ps aux | grep -E "(claude|agent)" | grep -v grep'

# Project-specific shortcuts
alias tasks='cat deno.json | jq .tasks 2>/dev/null || echo "Run from blog directory"'
alias config='echo "📝 Edit: /Users/szymondzumak/Developer/dev-hub/CLAUDE.md"'

# Enhanced prompt for agent context
autoload -U colors && colors 2>/dev/null
PS1="%{$fg[cyan]%}🤖[blog]%{$reset_color%} %{$fg[green]%}%c%{$reset_color%} %{$fg[yellow]%}➤%{$reset_color%} "

# Welcome message
echo "🤖 Zed terminal ready for agentic workflows!"
echo "💡 Quick commands: dev, test, check, build"
echo "🔍 Debug agents: acp-logs, agent-status"
echo "📁 Current: $(pwd)"