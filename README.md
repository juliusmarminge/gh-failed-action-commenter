# Github Action Failed Workflow Commenter

A GitHub Action that comments on a pull request when a workflow fails,
letting the PR author know that they need to fix their code.

## Usage

```yaml
name: Alert on failed workflow

on:
  pull_request:

jobs:
  ## Run your usual CI checks
  format:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup
        uses: ./tooling/github/setup

      - name: Format
        run: pnpm format

  comment-if-failed:
    runs-on: ubuntu-latest
    steps:
      - name: Check if workflow failed and comment
        uses: juliusmarminge/gh-failed-action-commenter@main
        with:
          FIXES: '"{ "format": "format:fix" }"'
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```
