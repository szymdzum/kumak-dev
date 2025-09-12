#!/bin/bash
# Claude Code Mastery System Setup
# One-command setup for the complete workflow system

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="Blog (Astro + Deno)"
CLAUDE_DIR=".claude"
REQUIRED_TOOLS=("claude-code" "deno" "git")

echo -e "${BLUE}╔══════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         CLAUDE CODE MASTERY SETUP           ║${NC}"  
echo -e "${BLUE}║              $PROJECT_NAME                   ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════╝${NC}"
echo ""

# Function to log with timestamp
log() {
    echo -e "[$(date '+%H:%M:%S')] $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to create directory if it doesn't exist
ensure_directory() {
    if [ ! -d "$1" ]; then
        mkdir -p "$1"
        log "${GREEN}✅ Created directory: $1${NC}"
    else
        log "${YELLOW}📁 Directory exists: $1${NC}"
    fi
}

# Check prerequisites
log "${BLUE}🔍 Checking prerequisites...${NC}"
MISSING_TOOLS=()

for tool in "${REQUIRED_TOOLS[@]}"; do
    if command_exists "$tool"; then
        log "${GREEN}✅ $tool found${NC}"
    else
        log "${RED}❌ $tool not found${NC}"
        MISSING_TOOLS+=("$tool")
    fi
done

if [ ${#MISSING_TOOLS[@]} -gt 0 ]; then
    echo ""
    log "${RED}❌ Missing required tools:${NC}"
    for tool in "${MISSING_TOOLS[@]}"; do
        echo "   - $tool"
    done
    echo ""
    echo "Install missing tools and run setup again."
    
    # Provide installation instructions
    echo "Quick install commands:"
    for tool in "${MISSING_TOOLS[@]}"; do
        case "$tool" in
            "claude-code")
                echo "   curl -sSL https://install.claude.ai/code | bash"
                ;;
            "deno")
                echo "   curl -fsSL https://deno.land/x/install/install.sh | sh"
                ;;
            "git")
                echo "   brew install git  # macOS"
                echo "   apt install git   # Ubuntu"
                ;;
        esac
    done
    exit 1
fi

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    log "${YELLOW}⚠️  Not in a git repository. Initializing...${NC}"
    git init
    log "${GREEN}✅ Git repository initialized${NC}"
fi

# Create directory structure
log "${BLUE}📁 Setting up directory structure...${NC}"

# Core directories
ensure_directory "$CLAUDE_DIR"
ensure_directory "$CLAUDE_DIR/plans"
ensure_directory "$CLAUDE_DIR/context"
ensure_directory "$CLAUDE_DIR/artifacts"
ensure_directory "$CLAUDE_DIR/specs"
ensure_directory "$CLAUDE_DIR/logs"
ensure_directory "$CLAUDE_DIR/hooks"

# Create workflow log
if [ ! -f "$CLAUDE_DIR/workflow.log" ]; then
    touch "$CLAUDE_DIR/workflow.log"
    log "${GREEN}✅ Created workflow log${NC}"
fi

# Create gitignore entries
log "${BLUE}🚫 Updating .gitignore...${NC}"
GITIGNORE_ENTRIES=(
    "# Claude Code workflow files"
    ".claude/context/"
    ".claude/logs/"
    ".claude/*.tmp"
    ".claude/artifacts/"
)

# Check if .gitignore exists, create if not
if [ ! -f ".gitignore" ]; then
    touch ".gitignore"
    log "${GREEN}✅ Created .gitignore${NC}"
fi

# Add entries to .gitignore if they don't exist
for entry in "${GITIGNORE_ENTRIES[@]}"; do
    if ! grep -Fxq "$entry" .gitignore; then
        echo "$entry" >> .gitignore
        log "${GREEN}✅ Added to .gitignore: $entry${NC}"
    fi
done

# Install monitoring tools
log "${BLUE}🔧 Setting up monitoring tools...${NC}"

# Check for ccusage
if command_exists "ccusage"; then
    log "${GREEN}✅ ccusage already installed${NC}"
else
    log "${YELLOW}📦 Installing ccusage...${NC}"
    if command_exists "bun"; then
        bunx ccusage --version > /dev/null 2>&1 && log "${GREEN}✅ ccusage available via bunx${NC}"
    elif command_exists "npm"; then
        npm install -g ccusage && log "${GREEN}✅ ccusage installed via npm${NC}"
    else
        log "${RED}❌ Neither bun nor npm found. Install one to get ccusage${NC}"
    fi
fi

# Create monitoring script from template
log "${BLUE}📊 Setting up monitoring scripts...${NC}"
MONITOR_SCRIPT="$CLAUDE_DIR/scripts/monitor.sh"

if [ -f "templates/monitoring/usage-monitor-template.sh" ]; then
    # Copy and customize the monitoring script
    cp "templates/monitoring/usage-monitor-template.sh" "$MONITOR_SCRIPT"
    
    # Replace template variables
    sed -i '' "s/{{project-name}}/$PROJECT_NAME/g" "$MONITOR_SCRIPT" 2>/dev/null || sed -i "s/{{project-name}}/$PROJECT_NAME/g" "$MONITOR_SCRIPT"
    sed -i '' "s/{{cost-threshold}}/5/g" "$MONITOR_SCRIPT" 2>/dev/null || sed -i "s/{{cost-threshold}}/5/g" "$MONITOR_SCRIPT"
    sed -i '' "s/{{token-threshold}}/50000/g" "$MONITOR_SCRIPT" 2>/dev/null || sed -i "s/{{token-threshold}}/50000/g" "$MONITOR_SCRIPT"
    
    chmod +x "$MONITOR_SCRIPT"
    log "${GREEN}✅ Monitoring script configured${NC}"
else
    log "${YELLOW}⚠️  Monitoring template not found, skipping${NC}"
fi

# Create workflow starter script
log "${BLUE}🚀 Setting up workflow scripts...${NC}"
cat > "$CLAUDE_DIR/scripts/workflow-start.sh" << 'EOF'
#!/bin/bash
# Start a new Claude Code workflow session

FEATURE_NAME="$1"
if [ -z "$FEATURE_NAME" ]; then
    echo "Usage: $0 <feature-name>"
    echo "Example: $0 dark-mode-toggle"
    exit 1
fi

# Create directories for this feature
mkdir -p ".claude/plans"
mkdir -p ".claude/context"

# Log the start
echo "$(date '+%Y-%m-%d %H:%M:%S') | WORKFLOW_START | $FEATURE_NAME" >> .claude/workflow.log

echo "🚀 Starting workflow for: $FEATURE_NAME"
echo ""
echo "Next steps:"
echo "1. Use Opus for planning: claude --model claude-opus-4-1-20250805"  
echo "2. Create plan: Save to .claude/plans/${FEATURE_NAME}-plan.md"
echo "3. Create handoff: Save to .claude/context/${FEATURE_NAME}-context.md"
echo "4. Switch to Sonnet: /model claude-sonnet-4-20250514"
echo "5. Execute: Read the context and implement step by step"
echo ""
echo "Files ready:"
echo "  📋 Plan: .claude/plans/${FEATURE_NAME}-plan.md"
echo "  🔗 Context: .claude/context/${FEATURE_NAME}-context.md"
echo "  📝 Progress: .claude/workflow.log"
EOF

chmod +x "$CLAUDE_DIR/scripts/workflow-start.sh"
log "${GREEN}✅ Workflow starter script created${NC}"

# Create emergency script
cat > "$CLAUDE_DIR/scripts/emergency.sh" << 'EOF'
#!/bin/bash
# Emergency procedures for Claude Code issues

echo "🚨 CLAUDE CODE EMERGENCY PROCEDURES 🚨"
echo ""

echo "1. Checking for running Claude processes..."
if pgrep -f "claude-code" > /dev/null; then
    echo "   ⚠️  Claude processes found. Stopping them..."
    pkill -f "claude-code"
    echo "   ✅ Claude processes stopped"
else
    echo "   ℹ️  No Claude processes running"
fi

echo ""
echo "2. Checking git status..."
git status --porcelain | head -10

echo ""
echo "3. Recent activity (last 10 operations):"
if [ -f ".claude/workflow.log" ]; then
    tail -10 .claude/workflow.log
else
    echo "   No activity log found"
fi

echo ""
echo "4. Usage check:"
if command -v ccusage >/dev/null 2>&1; then
    ccusage daily 2>/dev/null || echo "   Can't fetch usage data"
else
    echo "   ccusage not installed"
fi

echo ""
echo "🆘 Emergency options:"
echo "   git stash              # Save current changes"
echo "   git checkout .         # Nuclear reset (lose changes)"  
echo "   git checkout HEAD~1    # Go back one commit"
echo "   rm -rf .claude/context # Clear context files"
EOF

chmod +x "$CLAUDE_DIR/scripts/emergency.sh"
log "${GREEN}✅ Emergency script created${NC}"

# Setup tmux monitoring configuration
if command_exists "tmux"; then
    log "${BLUE}📺 Setting up tmux monitoring...${NC}"
    cat > "$CLAUDE_DIR/scripts/tmux-monitor.sh" << 'EOF'
#!/bin/bash
# Start comprehensive Claude monitoring in tmux

SESSION_NAME="claude-monitor"

# Kill existing session if it exists
tmux kill-session -t "$SESSION_NAME" 2>/dev/null

# Create new session
tmux new-session -d -s "$SESSION_NAME" -n "Main"

# Main window: Claude Code
tmux send-keys -t "$SESSION_NAME:Main" "cd $(pwd)" Enter
tmux send-keys -t "$SESSION_NAME:Main" "claude --dangerously-skip-permissions" Enter

# Split for monitoring
tmux split-window -t "$SESSION_NAME:Main" -h -p 40

# Top right: Live usage monitoring
if command -v ccusage >/dev/null 2>&1; then
    tmux send-keys -t "$SESSION_NAME:Main.1" "ccusage blocks --live" Enter
else
    tmux send-keys -t "$SESSION_NAME:Main.1" ".claude/scripts/monitor.sh" Enter
fi

# Bottom right: Activity log
tmux split-window -t "$SESSION_NAME:Main.1" -v
tmux send-keys -t "$SESSION_NAME:Main.2" "tail -f .claude/workflow.log" Enter

# Create development window
tmux new-window -t "$SESSION_NAME" -n "Dev"
tmux send-keys -t "$SESSION_NAME:Dev" "deno task dev" Enter

# Create testing window  
tmux new-window -t "$SESSION_NAME" -n "Test"
tmux send-keys -t "$SESSION_NAME:Test" "deno task test:watch" Enter

# Select main window and left pane
tmux select-window -t "$SESSION_NAME:Main"
tmux select-pane -t "$SESSION_NAME:Main.0"

# Attach to session
tmux attach-session -t "$SESSION_NAME"
EOF
    
    chmod +x "$CLAUDE_DIR/scripts/tmux-monitor.sh"
    log "${GREEN}✅ Tmux monitoring script created${NC}"
else
    log "${YELLOW}⚠️  tmux not found, skipping tmux setup${NC}"
fi

# Create shell aliases
log "${BLUE}🔧 Setting up shell aliases...${NC}"
ALIAS_FILE="$CLAUDE_DIR/aliases.sh"

cat > "$ALIAS_FILE" << 'EOF'
#!/bin/bash
# Claude Code Mastery System Aliases
# Source this file in your shell: source .claude/aliases.sh

# Core workflow commands
alias claude-start='claude --dangerously-skip-permissions'
alias claude-opus='claude --model claude-opus-4-1-20250805'
alias claude-sonnet='claude --model claude-sonnet-4-20250514'

# Monitoring
alias claude-monitor='./.claude/scripts/monitor.sh'
alias claude-tmux='./.claude/scripts/tmux-monitor.sh'
alias claude-status='ccusage statusline 2>/dev/null || echo "Install ccusage for status"'

# Workflow helpers
alias claude-workflow='./.claude/scripts/workflow-start.sh'
alias claude-emergency='./.claude/scripts/emergency.sh'
alias claude-log='tail -20 .claude/workflow.log'

# Development
alias blog-dev='deno task dev'
alias blog-test='deno task test'  
alias blog-check='deno task check-all'
alias blog-build='deno task build'

# Quick navigation
alias cd-plans='cd .claude/plans'
alias cd-context='cd .claude/context'
alias ls-plans='ls -la .claude/plans/'
alias ls-context='ls -la .claude/context/'

echo "✅ Claude Code aliases loaded!"
echo "   Type 'claude-start' to begin"
echo "   Type 'claude-monitor' for live monitoring"
echo "   Type 'claude-workflow <feature-name>' to start new workflow"
EOF

log "${GREEN}✅ Shell aliases created in $ALIAS_FILE${NC}"

# Create quick start guide
cat > "$CLAUDE_DIR/QUICKSTART.md" << 'EOF'
# Quick Start Guide

## 1. First Time Setup (Done!)
✅ Directories created
✅ Monitoring tools configured  
✅ Scripts installed
✅ Git integration ready

## 2. Daily Workflow

### Start a New Feature
```bash
# Load aliases
source .claude/aliases.sh

# Start new workflow  
claude-workflow my-feature-name

# Begin with Opus planning
claude-opus
```

### Monitor Your Usage
```bash
# Real-time monitoring
claude-monitor

# Or full tmux setup
claude-tmux
```

### Emergency Procedures
```bash
# If something goes wrong
claude-emergency

# Check recent activity
claude-log
```

## 3. Core Commands

| Command | Purpose |
|---------|---------|
| `claude-start` | Launch Claude Code with skip-permissions |
| `claude-opus` | Start Opus session for planning |
| `claude-sonnet` | Start Sonnet session for implementation |
| `claude-monitor` | Real-time usage monitoring |
| `claude-workflow <name>` | Start new feature workflow |

## 4. File Structure

```
.claude/
├── plans/          # Opus outputs
├── context/        # Bridge documents  
├── logs/           # Activity logs
├── scripts/        # Automation tools
└── workflow.log    # Progress tracking
```

## 5. Next Steps

1. Read the guides in `guides/` directory
2. Study the templates in `templates/`
3. Start your first workflow with `claude-workflow test-feature`

Happy coding! 🚀
EOF

# Final setup completion
log ""
log "${GREEN}🎉 SETUP COMPLETE!${NC}"
log ""
log "${BLUE}📋 Summary:${NC}"
log "   ✅ Directory structure created"
log "   ✅ Monitoring tools configured"
log "   ✅ Workflow scripts installed"  
log "   ✅ Git integration ready"
log "   ✅ Shell aliases prepared"
log ""
log "${BLUE}🚀 Next Steps:${NC}"
log "   1. Load aliases: ${YELLOW}source .claude/aliases.sh${NC}"
log "   2. Start monitoring: ${YELLOW}claude-monitor${NC}"  
log "   3. Begin workflow: ${YELLOW}claude-workflow my-first-feature${NC}"
log "   4. Read quickstart: ${YELLOW}cat .claude/QUICKSTART.md${NC}"
log ""
log "${BLUE}📚 Documentation:${NC}"
log "   • Guides: ${YELLOW}.claude/guides/${NC}"
log "   • Templates: ${YELLOW}.claude/templates/${NC}"
log "   • Examples: ${YELLOW}.claude/examples/${NC}"
log ""
log "${GREEN}Happy coding with Claude Code! 🎯${NC}"