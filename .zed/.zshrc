# Blog project shell configuration for Zed

# Source system zshrc first
[[ -f ~/.zshrc ]] && source ~/.zshrc

# Project-specific Deno tasks
alias dev='deno task dev'
alias build='deno task build'
alias lint='deno task lint'
alias format='deno task format'
alias check='deno task check-all'
alias fix='deno task fix'

# Git shortcuts
alias gs='git status'
alias gd='git diff'
alias gl='git log --oneline -5'

# Quick info
alias tasks='deno task --help 2>/dev/null || echo "Available tasks in deno.json"'

# Simple prompt
PS1="%c $ "