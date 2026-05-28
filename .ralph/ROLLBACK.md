# Rollback Recipes

## Golden Tag
`ralph-golden-20260528-0243`

## One-command rollback (full hard reset to golden)
```bash
cd /data/.openclaw/workspace/menswell
git reset --hard ralph-golden-20260528-0243
```

## Rollback to golden + delete local branch changes
```bash
cd /data/.openclaw/workspace/menswell
git checkout main
git branch -D refactor/ralph-loop-20260528
git checkout ralph-golden-20260528-0243 -b refactor/ralph-loop-20260528
```

## Backpressure rollback (single commit)
```bash
git reset --hard HEAD
```

## Restore from remote origin golden
```bash
git fetch origin
git reset --hard ralph-golden-20260528-0243
```

## Check current diff from golden
```bash
git diff ralph-golden-20260528-0243 --stat
```

## View all tags
```bash
git tag --list "ralph-*"
```
