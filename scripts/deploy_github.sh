#!/usr/bin/env bash
# One-shot: create the public GitHub repo under the logged-in account and push.
# Requires: `gh auth login` already done. Run from repo root.
set -euo pipefail

REPO="${1:-ponyrun}"
VIS="${2:-public}"   # public | private

cd "$(dirname "$0")/.."

if ! gh auth status >/dev/null 2>&1; then
  echo "✗ Not logged in. Run: gh auth login" >&2
  exit 1
fi

USER=$(gh api user --jq .login)
echo "→ creating ${VIS} repo ${USER}/${REPO} and pushing main…"

if gh repo view "${USER}/${REPO}" >/dev/null 2>&1; then
  echo "· repo already exists, adding remote + pushing"
  git remote remove origin 2>/dev/null || true
  git remote add origin "git@github.com:${USER}/${REPO}.git"
  git push -u origin main
else
  gh repo create "${REPO}" --"${VIS}" --source=. --remote=origin --push
fi

echo "✓ pushed: https://github.com/${USER}/${REPO}"
