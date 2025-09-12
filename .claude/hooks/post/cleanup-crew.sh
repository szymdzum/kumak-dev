#!/bin/bash
# The Cleanup Crew - Adapted for the Deno/Astro toolchain

# The hook's CWD is the script's location. We need to be in the project root.
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
PROJECT_ROOT=$(cd "$SCRIPT_DIR/../../.." && pwd)
cd "$PROJECT_ROOT" || exit 1

INPUT_JSON="$1"
FILE_PATH=$(echo "$INPUT_JSON" | jq -r '.tool_input.file_path // empty')
TOOL_NAME=$(echo "$INPUT_JSON" | jq -r '.tool_name')

# If no file path, exit
if [ -z "$FILE_PATH" ]; then
  exit 0
fi

# Only clean up code files relevant to this project
if [[ ! "$FILE_PATH" =~ \.(ts|tsx|js|jsx|mjs|astro)$ ]]; then
  exit 0
fi

# Only run after actual file operations
if [[ ! "$TOOL_NAME" =~ ^(WriteFile|Replace)$ ]]; then
  exit 0
fi

# Wait for file to actually exist
sleep 0.1

if [ ! -f "$FILE_PATH" ]; then
  echo "$(date '+%Y-%m-%d %H:%M:%S') | MISSING | $FILE_PATH" >> .claude/hooks/disasters.log
  exit 0
fi

# The Cleanup Pipeline™
CLEANED=0
LOG_DIR=".claude/hooks"

# 1. Deno Fmt - Make it pretty
# This uses the formatting rules from deno.json
if deno fmt "$FILE_PATH" >/dev/null 2>&1; then
  CLEANED=$((CLEANED + 1))
fi

# 2. Deno Lint - Check for style issues
deno lint "$FILE_PATH" >/dev/null 2>&1

# 3. Deno Check - See if we created a monster (TypeScript check)
if [[ "$FILE_PATH" =~ \.(ts|tsx|mjs|astro)$ ]]; then
  if ! deno check "$FILE_PATH" >/tmp/post-deno-check.txt 2>&1; then
    echo "$(date '+%Y-%m-%d %H:%M:%S') | DENO_CHECK_ERROR | $FILE_PATH | Claude broke the build again" >> "$LOG_DIR/disasters.log"
    echo "Errors: $(cat /tmp/post-deno-check.txt | head -5 | tr '\n' ' ')" >> "$LOG_DIR/disasters.log"
  fi
fi

# 4. Remove any console.logs Claude snuck in
if [[ "$FILE_PATH" =~ \.(ts|tsx|js|jsx|mjs|astro)$ ]]; then
  sed -i '' '/console\.log/d' "$FILE_PATH" 2>/dev/null || \
  sed -i '/console\.log/d' "$FILE_PATH" 2>/dev/null
fi

echo "$(date '+%Y-%m-%d %H:%M:%S') | CLEANED | $FILE_PATH | $CLEANED operations" >> "$LOG_DIR/audit.log"
exit 0
