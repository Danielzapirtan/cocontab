# Cantcol

Cantcol is a small, dependency-free monthly spending budget tracker. Set a
monthly budget, record expenses by category, and see your spending and
remaining budget at a glance. Data is saved in the current browser.

## Features

- Monthly budgets and expense totals in Romanian lei (RON)
- Expense dates, categories, and optional notes
- Monthly and category spending summaries
- Four tabs for the summary, expense form, history, and settings
- Local browser storage, plus JSON backup export and restore
- Optional sample data to help first-time testers explore the dashboard
- Responsive layout built with plain HTML, CSS, and JavaScript
- GitHub Pages deployment through GitHub Actions

## Running locally

Open `index.html` directly, or serve the project directory with any static file
server. For example:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Data and backups

The app stores versioned data under the `cantcol-monthly-budget-v1` key in
`localStorage`. Data is local to this browser and device; it is not synced or
encrypted. Use **Export backup** before clearing browser data or changing
devices, and **Restore backup** to replace the data in another browser.

On an empty browser profile, use **Încarcă date demonstrative** to populate the
current month with sample values. The control is hidden once a budget or
expense exists.

The previous journal data is not changed by the budget app. It remains in the
browser under its original local-storage key.

## Project structure

| File | Purpose |
| --- | --- |
| `index.html` | App structure and controls |
| `style.css` | Responsive visual styling |
| `script.js` | Budget behavior, storage, and backups |
| `.github/workflows/jekyll-gh-pages.yml` | GitHub Pages deployment |

## Deployment

The workflow publishes the repository to GitHub Pages on pushes to `main` or
`extend`, or when manually dispatched. Configure the repository's Pages source
to **GitHub Actions** under **Settings → Pages**.
