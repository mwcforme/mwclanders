import { test } from '@playwright/test';

const ROUTES = ['/', '/trt', '/ed', '/wl', '/book/symptom', '/book/schedule', '/book/confirmed'];
const VIEWPORTS = [
  { name: '375', width: 375, height: 812 },
  { name: '768', width: 768, height: 1024 },
  { name: '1440', width: 1440, height: 900 },
];

for (const route of ROUTES) {
  for (const vp of VIEWPORTS) {
    test(`baseline ${route} @${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(`http://localhost:4173${route}`, { waitUntil: 'networkidle' });
      const name = route.replace(/\//g, '_').replace(/^_/, '') || 'home';
      await page.screenshot({ path: `ux/baseline/${name}-${vp.name}.png`, fullPage: true });
    });
  }
}
