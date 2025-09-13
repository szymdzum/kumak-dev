#!/bin/sh

echo "🔧 Setting up git hooks..."

# Create hooks directory if it doesn't exist
mkdir -p .git/hooks

# Copy pre-commit hook
cp scripts/pre-commit .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit

echo "✅ Git hooks installed successfully!"
echo "📝 Pre-commit checks will run: formatting, linting, and tests"
echo "🚨 Use 'git commit --no-verify' to bypass hooks in emergencies"