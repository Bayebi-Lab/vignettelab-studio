# Commit and Push

## Overview
Intelligently commit all current changes by analyzing them, grouping related changes, and creating meaningful commit messages. This command can create multiple commits for better clarity and organization.

## Process

1. **Analyze changes**
   - Run `git status --short` to see all changes
   - Use `git diff` to understand what changed in modified files
   - Examine new files to understand their purpose
   - Group related changes logically (e.g., features, fixes, config, docs)

2. **Create logical commit groups**
   - Group changes by feature/functionality (e.g., "Add checkout flow", "Add admin dashboard")
   - Group changes by type (e.g., "Update dependencies", "Add documentation")
   - Group configuration changes separately (e.g., "Configure Cursor commands", "Update environment setup")
   - Each group should represent a cohesive change

3. **Generate commit messages**
   - Create clear, descriptive commit messages based on understanding the changes
   - Use conventional commit format when appropriate (feat:, fix:, docs:, chore:, etc.)
   - Make messages specific and informative
   - Examples:
     - "feat: add checkout flow with Stripe integration"
     - "feat: add admin dashboard for order management"
     - "chore: add Cursor commit-and-push command"
     - "docs: add migration and setup documentation"
     - "config: add Supabase configuration and migrations"

4. **Create commits**
   - For each logical group:
     - Stage only the files in that group: `git add <file1> <file2> ...`
     - Commit with the generated message: `git commit -m "<message>"`
   - If all changes truly belong together, create a single commit
   - Aim for clarity: multiple small commits are better than one large commit

5. **Push to remote**
   - After all commits are created, push to the current branch
   - Get current branch: `git branch --show-current`
   - Push: `git push origin <branch-name>`

## Commit Message Guidelines

- Start with a verb in imperative mood (Add, Fix, Update, Remove, etc.)
- Be specific about what changed
- Include context when helpful (e.g., "Add checkout flow" vs "Add checkout flow with image upload and Stripe payment")
- Use conventional commits format when it adds clarity:
  - `feat:` for new features
  - `fix:` for bug fixes
  - `docs:` for documentation
  - `chore:` for maintenance tasks
  - `config:` for configuration changes
  - `refactor:` for code refactoring

## Examples of Logical Grouping

**Example 1: Multiple features**
- Commit 1: "feat: add user authentication with Supabase"
- Commit 2: "feat: add checkout flow with Stripe integration"
- Commit 3: "feat: add admin dashboard for order management"
- Commit 4: "docs: add setup and migration documentation"

**Example 2: Feature + Config**
- Commit 1: "feat: add checkout functionality"
- Commit 2: "chore: add Cursor commands for git workflow"
- Commit 3: "config: update package dependencies"

**Example 3: Single cohesive change**
- Commit 1: "feat: add checkout flow with payment processing"

## Notes

- Always analyze changes before committing - understand what each file does
- Group related changes together for better git history
- Create multiple commits when it improves clarity and makes the history more readable
- If there are no changes, inform the user and exit gracefully
- Handle errors appropriately (e.g., if push fails due to conflicts)
- Show the user what commits were created before pushing
