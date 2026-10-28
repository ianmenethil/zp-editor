# Zenith changelog

Changes made by Zenith to this fork of [live-codes/livecodes](https://github.com/live-codes/livecodes). Upstream's own history is in `CHANGELOG.md`, which is not edited here. Newest first.

- **2026-04-17** — Publishing now sets the custom domain `editor.zenithpayments.support` on the `gh-pages` branch (`deploy` script in `package.json`).
- **2026-04-17** — Merged the latest upstream `develop` into the fork and kept the upstream translation-sync workflows deleted; a snapshot commit before the merge carried the regenerated lockfile, template list and Bengali, Indonesian and Dutch translations.
- **2026-02-16** — Deleted the unused upstream workflow files (Docker deploy, release, release PR and translation-sync workflows), leaving only the deploy and upstream-sync workflows.
- **2026-02-16** — The Firebase sign-in configuration is now read from a GitHub Actions variable and embedded into the build as a JSON string.
- **2026-02-16** — The build now points at the shared public sandbox host `livecodes-sandbox.pages.dev` instead of one hosted with the site.
- **2026-02-16** — Publishing now uses the built-in `GITHUB_TOKEN` rather than a separate GitHub App.
- **2026-02-16** — Added a self-hosted build mode (`SELF_HOSTED`) and a weekly workflow that opens a pull request merging new upstream `develop` commits.
- **2025-11-19** — Added deployment guides and the `scripts/deploy-github.sh` helper for publishing to GitHub Pages.
- **2025-11-17** — Regenerated the translation and generated files after merging upstream.
- **2025-11-17** — Added a `CLAUDE.md` developer guide for AI assistants.
