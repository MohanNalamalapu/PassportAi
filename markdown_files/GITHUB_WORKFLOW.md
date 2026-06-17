# PassportAI GitHub Workflow

## Branching Strategy

For the two-day build, keep branching simple:

```text
main
feature/core-flow
feature/compliance-engine
feature/ui-polish
```

If working solo, short-lived branches are enough. Merge frequently to avoid late integration surprises.

## Commit Style

Use clear conventional-style commits:

```text
feat: add template registry
feat: implement upload flow
feat: add compliance engine
fix: handle remove-bg failures
docs: add deployment plan
chore: configure docker
```

## Pull Request Checklist

Each PR should answer:

- What changed?
- How was it tested?
- Does upload-to-result flow still work?
- Did any environment variables change?
- Are sensitive keys kept server-side?

## Required Checks

Before merge or demo freeze:

```text
npm run lint
npm run typecheck
npm run build
```

If test scripts are added:

```text
npm test
```

## Recommended GitHub Actions

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  pull_request:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run build
```

## Release Tags

Use lightweight release tags for presentation readiness:

```text
demo-monday-foundation
demo-tuesday-core-complete
demo-wednesday-deploy-ready
```

## Repository Hygiene

Do commit:

- Source code.
- Template JSON.
- Public sample images if licensed or generated.
- Documentation.
- Dockerfile and deployment config.

Do not commit:

- API keys.
- `.env.local`.
- User-uploaded images.
- Large generated outputs.
- Private founder demo notes.

## Issue Labels

Suggested labels:

- demo-critical
- ai-cv
- ui-polish
- deployment
- bug
- docs
- optional

## Wednesday Freeze Rule

By Wednesday evening:

- Only bug fixes, UI polish, and deployment fixes.
- No new architecture changes.
- No new AI provider integrations.
- No database unless the core flow is already stable.

