#!/bin/bash
# Blog-specific Claude Code Monitor
# Customized for Astro/Deno development workflow

set -e

# Configuration
PROJECT_NAME="Blog (Astro + Deno)"
LOG_DIR=".claude/logs"
ALERT_THRESHOLD="5"  # Dollar amount
TOKEN_THRESHOLD="50000"  # Token count

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Ensure log directory exists
mkdir -p "$LOG_DIR"

# Function to log with timestamp
log_with_timestamp() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_DIR/usage.log"
    echo -e "$1"
}

# Function to check if ccusage is installed
check_dependencies() {
    if ! command -v ccusage &> /dev/null && ! command -v bunx &> /dev/null; then
        log_with_timestamp "${RED}❌ ccusage not found. Install with: npm install -g ccusage${NC}"
        echo "   Or use bunx: bunx ccusage"
        return 1
    fi
    return 0
}

# Function to get current usage statistics
get_usage_stats() {
    local cost="0"
    local tokens="0"
    
    if command -v ccusage &> /dev/null; then
        cost=$(ccusage daily --json 2>/dev/null | jq -r '.cost // "0"' 2>/dev/null || echo "0")
        tokens=$(ccusage daily --json 2>/dev/null | jq -r '.tokens // "0"' 2>/dev/null || echo "0")
    elif command -v bunx &> /dev/null; then
        # Try with bunx
        local usage_output
        usage_output=$(bunx ccusage daily --json 2>/dev/null || echo '{"cost":"0","tokens":"0"}')
        cost=$(echo "$usage_output" | jq -r '.cost // "0"' 2>/dev/null || echo "0")
        tokens=$(echo "$usage_output" | jq -r '.tokens // "0"' 2>/dev/null || echo "0")
    fi
    
    echo "$cost|$tokens"
}

# Function to send alert
send_alert() {
    local message="$1"
    local title="${2:-Claude Alert}"
    
    log_with_timestamp "${YELLOW}🚨 ALERT: $message${NC}"
    
    # Try different notification methods
    if command -v osascript >/dev/null 2>&1; then
        # macOS notification
        osascript -e "display notification \"$message\" with title \"$title\"" 2>/dev/null
    elif command -v notify-send >/dev/null 2>&1; then
        # Linux notification
        notify-send "$title" "$message" 2>/dev/null
    fi
    
    # Terminal bell
    printf '\a'
}

# Function to get Deno project status
get_deno_status() {
    local status="unknown"
    local dev_running="❌"
    
    # Check if deno task dev is running
    if pgrep -f "deno.*task.*dev" > /dev/null; then
        dev_running="✅"
    fi
    
    # Check if we can run deno commands
    if command -v deno >/dev/null 2>&1; then
        status="available"
    else
        status="missing"
    fi
    
    echo "$status|$dev_running"
}

# Function to display current status
display_status() {
    clear
    echo "╔══════════════════════════════════════════════╗"
    echo "║         CLAUDE CODE MONITOR - BLOG          ║"
    echo "╠══════════════════════════════════════════════╣"
    
    # Check if Claude is running
    local claude_status="❌ Not Running"
    local model="unknown"
    if pgrep -f "claude-code" > /dev/null; then
        claude_status="✅ Running"
        model=$(ps aux | grep claude-code | grep -o 'opus\|sonnet' | head -1 || echo "unknown")
    fi
    
    echo -e "║ Claude: $claude_status ($model)             ║"
    
    # Deno project status
    local deno_info
    deno_info=$(get_deno_status)
    local deno_status=$(echo "$deno_info" | cut -d'|' -f1)
    local dev_running=$(echo "$deno_info" | cut -d'|' -f2)
    
    echo -e "║ Deno: $deno_status    Dev Server: $dev_running      ║"
    
    # Project info
    echo "║ Project: $PROJECT_NAME                       ║"
    echo "║ Directory: $(basename "$(pwd)")              ║"
    
    if git rev-parse --git-dir > /dev/null 2>&1; then
        local branch
        branch=$(git branch --show-current 2>/dev/null || echo "unknown")
        local changed_files
        changed_files=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')
        echo "║ Git: $branch ($changed_files changed)        ║"
    fi
    
    # Usage stats
    local stats
    stats=$(get_usage_stats)
    local current_cost
    current_cost=$(echo "$stats" | cut -d'|' -f1)
    local current_tokens
    current_tokens=$(echo "$stats" | cut -d'|' -f2)
    
    if [ "$current_cost" != "0" ]; then
        echo "║ Today's Cost: \$${current_cost}                    ║"
        echo "║ Today's Tokens: ${current_tokens}                ║"
        
        # Check thresholds
        if (( $(echo "$current_cost > $ALERT_THRESHOLD" | bc -l 2>/dev/null || echo 0) )); then
            echo -e "║ ${RED}⚠️  Cost threshold exceeded!${NC}            ║"
        fi
    else
        echo "║ Usage: Install ccusage for live data        ║"
    fi
    
    # Recent activity
    if [ -f ".claude/workflow.log" ]; then
        local last_activity
        last_activity=$(tail -1 .claude/workflow.log 2>/dev/null | cut -c1-40)
        echo "║ Last: $last_activity                        ║"
    fi
    
    # Blog-specific info
    if [ -f "deno.json" ]; then
        local astro_version
        astro_version=$(grep '"astro"' deno.json 2>/dev/null | head -1 | cut -d'"' -f4 || echo "unknown")
        echo "║ Astro: $astro_version                       ║"
    fi
    
    echo "╚══════════════════════════════════════════════╝"
    
    # Blog development commands
    echo ""
    echo "Blog Commands:"
    echo "  [d] deno task dev    [t] deno task test    [c] deno task check"
    echo "  [b] deno task build  [l] View Logs        [q] Quit"
    echo "Claude Commands:"  
    echo "  [o] Start Opus      [s] Start Sonnet      [k] Kill Claude"
}

# Function to handle blog-specific commands
handle_blog_command() {
    local cmd="$1"
    
    case "$cmd" in
        d|D)
            echo "Starting Deno dev server..."
            deno task dev &
            echo "Dev server started in background"
            sleep 2
            ;;
        t|T)
            echo "Running tests..."
            deno task test
            read -p "Press Enter to continue..."
            ;;
        c|C)
            echo "Running type check and linting..."
            deno task check-all
            read -p "Press Enter to continue..."
            ;;
        b|B)
            echo "Building project..."
            deno task build
            read -p "Press Enter to continue..."
            ;;
        o|O)
            echo "Starting Claude with Opus..."
            claude --model claude-opus-4-1-20250805 &
            echo "Claude Opus started"
            sleep 2
            ;;
        s|S)
            echo "Starting Claude with Sonnet..."
            claude --model claude-sonnet-4-20250514 &
            echo "Claude Sonnet started"
            sleep 2
            ;;
        k|K)
            echo "Stopping Claude processes..."
            pkill -f claude-code 2>/dev/null || echo "No Claude processes found"
            echo "Claude stopped"
            sleep 1
            ;;
        l|L)
            if [ -f "$LOG_DIR/usage.log" ]; then
                tail -20 "$LOG_DIR/usage.log"
            else
                echo "No logs found"
            fi
            read -p "Press Enter to continue..."
            ;;
    esac
}

# Function to monitor in real-time
monitor_loop() {
    local refresh_rate=${1:-3}  # Default 3 seconds
    
    while true; do
        display_status
        echo ""
        echo "Monitoring every ${refresh_rate}s... (Press command key + Enter)"
        
        # Check for user input with timeout
        if read -t "$refresh_rate" -n 1 input; then
            case "$input" in
                q|Q)
                    echo ""
                    log_with_timestamp "Monitor stopped by user"
                    break
                    ;;
                d|D|t|T|c|C|b|B|o|O|s|S|k|K|l|L)
                    echo ""
                    handle_blog_command "$input"
                    ;;
                r|R)
                    continue
                    ;;
            esac
        fi
        
        # Check usage and alert if needed
        local stats
        stats=$(get_usage_stats)
        local current_cost
        current_cost=$(echo "$stats" | cut -d'|' -f1)
        
        if [ "$current_cost" != "0" ] && (( $(echo "$current_cost > $ALERT_THRESHOLD" | bc -l 2>/dev/null || echo 0) )); then
            send_alert "Daily cost (\$${current_cost}) exceeded threshold (\$${ALERT_THRESHOLD})"
            # Log the alert
            echo "$(date '+%Y-%m-%d %H:%M:%S') | ALERT | Cost threshold exceeded: \$${current_cost}" >> "$LOG_DIR/alerts.log"
        fi
    done
}

# Function to show usage logs
show_logs() {
    echo "Recent Usage Logs:"
    if [ -f "$LOG_DIR/usage.log" ]; then
        tail -20 "$LOG_DIR/usage.log"
    else
        echo "No logs found"
    fi
    
    echo ""
    echo "Recent Alerts:"
    if [ -f "$LOG_DIR/alerts.log" ]; then
        tail -10 "$LOG_DIR/alerts.log"
    else
        echo "No alerts"
    fi
    
    echo ""
    echo "Recent Workflow Activity:"
    if [ -f ".claude/workflow.log" ]; then
        tail -10 .claude/workflow.log
    else
        echo "No workflow activity"
    fi
}

# Main script logic
case "${1:-monitor}" in
    "monitor"|"")
        if check_dependencies; then
            log_with_timestamp "Starting Claude Code monitor for $PROJECT_NAME"
            monitor_loop "${2:-3}"
        else
            echo "Please install ccusage or ensure bunx is available"
            exit 1
        fi
        ;;
    "status")
        display_status
        ;;
    "logs")
        show_logs
        ;;
    "setup")
        echo "Setting up monitoring for $PROJECT_NAME..."
        mkdir -p "$LOG_DIR"
        if check_dependencies; then
            echo "✅ Monitor setup complete"
            echo "Run './monitor.sh' to start monitoring"
        else
            echo "❌ Setup incomplete - missing dependencies"
            exit 1
        fi
        ;;
    "help"|"-h"|"--help")
        echo "Usage: $0 [command] [options]"
        echo ""
        echo "Commands:"
        echo "  monitor [seconds]  Start real-time monitoring (default: 3s refresh)"
        echo "  status            Show current status once"
        echo "  logs              Show recent usage logs"
        echo "  setup             Setup monitoring directory and check dependencies"
        echo "  help              Show this help message"
        echo ""
        echo "Interactive Commands (during monitoring):"
        echo "  d - deno task dev      t - deno task test"
        echo "  c - deno task check    b - deno task build"
        echo "  o - Start Opus         s - Start Sonnet"
        echo "  k - Kill Claude        l - View logs"
        echo "  q - Quit monitor       r - Refresh"
        echo ""
        echo "Configuration:"
        echo "  ALERT_THRESHOLD: \$${ALERT_THRESHOLD}"
        echo "  TOKEN_THRESHOLD: $TOKEN_THRESHOLD"
        ;;
    *)
        echo "Unknown command: $1"
        echo "Run '$0 help' for usage information"
        exit 1
        ;;
esac