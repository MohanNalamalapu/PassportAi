# GitHub Workflow

Branching strategy and delivery process for the PassportAI codebase.

## Workflow Rules

### 1. Branch Naming
All changes must be developed in branch names following these patterns:
*   `feat/your-feature-name` for new user features or components.
*   `fix/your-fix-name` for bug fixes or layout repairs.
*   `chore/...` or `docs/...` for tasks and documentation edits.

### 2. Code Lifecycle
1.  **Create local branch**: `git checkout -b feat/my-feature`
2.  **Write code & verify**: Ensure all files build locally.
3.  **Push and PR**: Push changes to GitHub and open a Pull Request (PR) to merge into the `main` branch.
4.  **CI Validation**: GitHub Actions runs automated scripts:
    *   Checks TypeScript types (`npm run typecheck`)
    *   Ensures clean coding standards (`npm run lint`)
    *   Executes tests (`npm run test`)
5.  **Merge**: Once CI checks pass and reviews are approved, the branch is merged into `main`.

### 3. Deployments
Merged commits on the `main` branch trigger automatic build triggers on Render/Vercel to deploy updates.
