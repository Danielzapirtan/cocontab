# Copilot instructions for Cantcol

## Project overview

Cantcol is a dependency-free static web app for monthly spending budgets.
There is no package manager, bundler, framework, backend, or runtime service:

- `index.html` contains the budget dashboard, forms, and backup controls.
- `style.css` provides responsive styling.
- `script.js` handles budgets, expenses, summaries, and local persistence.
- `.github/workflows/jekyll-gh-pages.yml` publishes the repository root to
  GitHub Pages; Jekyll is only used as the Pages packaging step.

Keep the app framework-free and work within these existing files unless a
specific requirement justifies adding more. Do not add a build step or runtime
dependency for small features.

## Data and behavior

- The browser is the source of truth. Persist version 1 data under
  `cantcol-monthly-budget-v1` as `{ version, budgets, expenses }`.
- Budgets and expense amounts are integer bani; avoid floating-point arithmetic
  when calculating or saving money.
- Expenses have an ISO date, one of the existing categories, an amount, and an
  optional note. Filter all dashboard totals by the selected month.
- Validate stored and imported data. Surface storage or backup errors instead
  of silently replacing invalid data.
- Build dynamic UI with DOM methods and `textContent`; do not interpolate
  user-entered notes into HTML.
- The prototype notice must make local-only, unsynced, unencrypted storage
  clear. Optional sample data should only seed a completely empty budget.
- Keep backup export and restore compatible with the current versioned data
  shape. The old journal data is separate and must not be overwritten.
- The UI displays RON. Keep labels and status messages in English unless a
  localization change is requested.

## Running and validating

Open `index.html` directly or serve the root directory, for example:

```bash
python3 -m http.server 8000
```

There are no automated test, lint, or build commands. For behavior changes,
check in a browser that budgets and expenses save, month switching filters the
view, deleting an expense updates totals, reload preserves data, and backup
export/restore works as applicable.

## Deployment

Changes pushed to `main` or `extend` can trigger the Pages workflow. The
repository must have GitHub Pages configured to use **GitHub Actions** under
**Settings → Pages**.
