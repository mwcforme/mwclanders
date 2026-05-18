# Ralph Backpressure Commands

Run in this order before every commit:

```bash
# 1. Type check
npx tsc --noEmit

# 2. Tests
npx vitest run

# 3. Build
timeout 120 npx vite build --logLevel silent
```

All three must be green (exit 0) for a commit to proceed.
If any fails: git reset --hard HEAD and mark task BLOCKED.
