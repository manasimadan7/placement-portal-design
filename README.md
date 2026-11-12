# Placement Portal – design documentation

Case study for the IIT Bombay placement portal redesign: students, the placement team and hiring managers.

**Live site:** https://manasimadan7.github.io/placement-portal-design/

## Run locally

```bash
npm install
npm run dev
```

## Publish

Every push to `main` builds the site and deploys it to GitHub Pages (`.github/workflows/deploy.yml`).

The live phone prototype on the Placement Team page is a built copy of the portal app in `public/portal-app`. To refresh it after changing the app, run this from the app folder:

```bash
npx vite build --base ./ --outDir "<path to this repo>/public/portal-app" --emptyOutDir
```
