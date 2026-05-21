# AGENTS.md — Ralph Loop Refactor
## Project
- Stack: Vite + React + TypeScript + Tailwind + shadcn/ui + Supabase
- Package manager: npm
- Working dir: /data/.openclaw/workspace/menswell
- Target: src/ (exclude src/integrations/**, src/components/ui/**)

## Backpressure (every iteration, in order)
1. npm run lint -- --max-warnings 0
2. npx tsc --noEmit
3. npm test -- --run --coverage
4. npm run build

## Metric commands
- LOC: cloc src --exclude-dir=integrations,ui --json
- Bundle: ls -la dist/assets/*.js 2>/dev/null
- Dead code: npx knip
- Coverage: cat coverage/coverage-summary.json 2>/dev/null

## House rules
- No any. No @ts-ignore. No unjustified as casts.
- Components <= 150 LOC. Functions <= 30 LOC. Cyclomatic complexity <= 8.
- Pure functions where I/O not required.
- Supabase access only via src/services/<entity>.ts
- Zod-validate every external boundary.
- SRP > OCP > LSP > ISP > DIP.
- Do not touch: src/integrations/**, src/components/ui/**, .lovable/**, generated types.
- MWC brand voice: "Men's Wellness Centers", "members" not "patients", no em-dashes.

## Learnings
(appended by agent)
