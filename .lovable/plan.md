## Plan

You'll be pulling your own landing page code from GitHub, so I'll keep this project as a bare minimum shell and not add any UI, design system customization, routes, or dependencies.

### What I'll do
- Leave the existing TanStack Start shell (`src/router.tsx`, `src/routes/__root.tsx`, `src/routes/index.tsx`) intact.
- Replace the placeholder content in `src/routes/index.tsx` with a tiny empty page (just an empty `<main />`) so the build doesn't flag the placeholder, but nothing visual is committed.

### What I won't do
- No new routes, components, assets, or pages.
- No design tokens, fonts, or color changes in `src/styles.css`.
- No new dependencies.
- No backend / Lovable Cloud setup.

When you pull your code from GitHub, it'll overwrite cleanly with no leftover scaffolding to remove.