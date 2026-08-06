---
name: github-integration
description: Handles pushing code, checking repository status, syncing branches, and running GitHub operations using the user's configured GitHub token. Trigger when the user asks to "push to GitHub", "check my GitHub", or run Git/GitHub operations.
---

# GitHub Integration Skill

This skill allows the agent to check GitHub repository status, pull, commit, and push code seamlessly using the configured GitHub remote URL / authentication token.

## Executable Path
`C:\Users\ranja\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\git\cmd\git.exe`

## Workflows

### 1. Push to GitHub
When the user asks to "push to GitHub", "push changes", or similar:
1. Run `git status` using `run_command` with the Git executable path.
2. Stage all modified and new files: `git add .`
3. Create a commit: `git commit -m "<descriptive message>"`
4. Pull remote changes to prevent conflicts (without rebasing):
   `git pull origin main --no-rebase --no-edit`
5. Push to GitHub:
   `git push origin main`

### 2. Check my GitHub
When the user asks to "check my GitHub", "check repo status", or similar:
1. Run `git status` and `git log -n 5`.
2. Inspect remote branch sync status and report modified/uncommitted files.
