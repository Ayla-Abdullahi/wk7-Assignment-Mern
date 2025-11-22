# MERN Week 7 – Deployment & DevOps Example Implementation

This repository now contains a reference scaffold implementing the Week 7 objectives: production‑ready MERN backend & frontend, CI/CD workflows, environment templates, monitoring placeholders, caching strategy, and deployment scripts.

## Assignment Overview

You will:
1. Prepare your MERN application for production deployment
2. Deploy the backend to a cloud platform
3. Deploy the frontend to a static hosting service
4. Set up CI/CD pipelines with GitHub Actions
5. Implement monitoring and maintenance strategies

## Getting Started

1. Accept the GitHub Classroom assignment invitation
2. Clone your personal repository that was created by GitHub Classroom
3. Follow the setup instructions in the `Week7-Assignment.md` file
4. Use the provided templates and configuration files as a starting point

## Repository Structure

```
backend/                # Express API (security headers, logging, error handling)
  src/                  # Source code
    app.js              # App bootstrap (helmet, compression, CORS, metrics)
    routes/health.js    # Health & metrics endpoints
    middleware/         # Error & request logging
    config/             # Environment configuration loader
    utils/logger.js     # Winston structured logger
  .env.example          # Backend environment template
  Dockerfile            # Production container image
frontend/               # React app (Vite, code splitting, service worker)
  src/App.jsx           # React.lazy demo for code splitting
  src/components/Hello.jsx  # Fetches backend health
  src/performance.js    # Performance & Sentry placeholders
  .env.example          # Frontend env template
  Dockerfile            # Build & serve via Nginx
  sw.js                 # Simple asset caching service worker
.github/workflows/      # CI/CD workflows (CI, CD backend, CD frontend)
docker-compose.yml      # Local multi-service setup (backend+frontend+mongo)
deploy.sh               # Placeholder deployment & rollback script
Week7-Assignment.md     # Original assignment brief
```

## Requirements

- A completed MERN stack application from previous weeks
- Accounts on the following services:
  - GitHub
  - MongoDB Atlas
  - Render, Railway, or Heroku (for backend)
  - Vercel, Netlify, or GitHub Pages (for frontend)
- Basic understanding of CI/CD concepts

## Deployment Platforms

### Backend Deployment Options
- **Render**: Easy to use, free tier available
- **Railway**: Developer-friendly, generous free tier
- **Heroku**: Well-established, extensive documentation

### Frontend Deployment Options
- **Vercel**: Optimized for React apps, easy integration
- **Netlify**: Great for static sites, good CI/CD
- **GitHub Pages**: Free, integrated with GitHub

## CI/CD Workflows

Implemented in `.github/workflows/`:
- `ci.yml`: Lints, runs real Jest & Vitest tests, builds backend & frontend with Node matrix (18 & 20) across staging and production axes; archives artifacts.
- `cd-backend.yml`: Post‑CI backend deployment (Render API or Railway CLI) with health check & conditional rollback placeholder.
- `cd-frontend.yml`: Post‑CI frontend deployment (Vercel CLI) with aliasing and rollback guidance.

Rollback Strategy (Conceptual):
1. Keep last successful artifact (tag / commit SHA).
2. After deploy, run health check (`/api/health`) and root page fetch.
3. On failure, redeploy previous artifact and create incident log entry.

## Deployment Instructions

### Local (Docker Compose)
```
docker compose up --build
```
Access backend: `http://localhost:4000/api/health`  
Access frontend (Nginx): `http://localhost:5173/`

### Local URLs (Current Mapping)
- Backend base: `http://localhost:4001`
- Health: `http://localhost:4001/api/health`
- Metrics: `http://localhost:4001/api/metrics`
- Frontend: `http://localhost:5173/`

Note: Ports differ from defaults to avoid local conflicts (backend 4001, Mongo 27018).

### Backend (Render / Railway / Heroku Example)
1. Set environment variables from `backend/.env.example` (never commit real secrets).
2. Set build/run command: `npm ci && npm run start` (Node 20 recommended).
3. Add health check path `/api/health`.
4. Enable autoscaling / metrics (platform specific).

### Frontend (Vercel / Netlify)
1. Provide `VITE_API_BASE_URL` pointing to deployed backend.
2. Build command: `npm run build`.
3. Output directory: `dist`.
4. For custom domain: configure DNS & enforce HTTPS.

### HTTPS & Custom Domains
Platforms handle TLS automatically; ensure HSTS and redirect HTTP→HTTPS. Add CORS origin restrictions in `backend/src/app.js` once domains known.

### Environment Configuration
Use three sets of variables: development (local), staging, production. Keep secrets in platform variable stores. Mirror keys across environments for parity.
#### Staging vs Production
Workflows distinguish environments via branch (`main` → production deploy, `staging` → staging jobs). Provide distinct secrets:
```
RENDER_SERVICE_ID (prod)          RENDER_SERVICE_ID_STAGING
RENDER_API_KEY (prod)             RENDER_API_KEY_STAGING
RAILWAY_TOKEN (prod)              RAILWAY_TOKEN_STAGING
BACKEND_URL (prod)                BACKEND_URL_STAGING
VERCEL_TOKEN (prod)               VERCEL_TOKEN_STAGING
VERCEL_ORG_ID / PROJECT_ID (prod) VERCEL_ORG_ID_STAGING / VERCEL_PROJECT_ID_STAGING
FRONTEND_URL (prod)               FRONTEND_URL_STAGING
```
Frontend env difference: staging build uses `VITE_API_BASE_URL` pointing at the staging backend URL. Restrict CORS by setting `ALLOWED_ORIGINS` to the production + staging domains.

### Monitoring & Logging
- Health: `/api/health` returns status & DB readiness.
- Metrics: `/api/metrics` (enable with `ENABLE_METRICS=true`) includes memory, event‑loop lag, request duration histogram.
- Structured logs: Winston JSON to stdout (aggregated by host platform).
- Error tracking: Provide Sentry DSNs via `SENTRY_DSN` / `VITE_SENTRY_DSN`.
- Frontend performance: Navigation Timing, Core Web Vitals (CLS, LCP, FID) breadcrumbs to Sentry.
- Uptime: Configure external service (UptimeRobot / StatusCake) hitting `/api/health` every 1–5 minutes.

### Database
Provision MongoDB Atlas cluster:
1. Create project & cluster.
2. Add database user with least privilege (readWrite on specific DB).
3. Whitelist platform egress IP or use VPC peering.
4. Replace `MONGO_URI` with SRV string; require TLS by default.

### Security Hardening
- `helmet()` applied for headers.
- Rate limiting via `express-rate-limit` (15 min window / 100 requests).
- CORS restricted to `ALLOWED_ORIGINS` list once domains known.
- Enforce HTTPS (platform redirect) and HSTS via custom header if needed.
- Audit dependencies: `npm audit --production` in CI (add step optionally).

### Caching Strategy
- Service worker pre-caches shell & lazily caches fetched assets.
- Nginx serves static build with gzip; add `Cache-Control` via custom config if needed.
- Code splitting via `React.lazy` reduces initial bundle.

### Rollback Procedure (Detailed)
1. Deployment completes; capture deployment ID/commit SHA.
2. Automated health check hits `/api/health`; on failure mark build unstable.
3. Trigger rollback job (manual or automatic):
  - Render: redeploy previous successful deploy via API using stored ID.
  - Railway: `railway up --service backend --commit <prev-sha>`.
  - Vercel: `vercel rollback <deployment-url>`.
4. Post-rollback verification (health + homepage fetch).
5. Incident record: store logs, metrics snapshot, timeline.
6. Root cause analysis & follow-up task.

### Maintenance Plan
- Weekly: dependency updates (`npm outdated`), lint & test run, audit.
- Monthly: security review (`npm audit --production`), rotate API keys if required.
- Quarterly: backup restore test from Atlas snapshot; chaos test failover.
- Logs: retention 14 days (adjust platform setting), export critical error traces.
- Metrics: review latency histogram percentiles (p95, p99) & memory trends.
- Access: revalidate least-privilege MongoDB user roles.

### Secrets Management
Add secrets via GitHub UI (Settings → Secrets and variables → Actions) or CLI:
```
gh secret set RAILWAY_TOKEN --body "<prod-token>"
gh secret set RAILWAY_TOKEN_STAGING --body "<staging-token>"
gh secret set RENDER_API_KEY --body "<prod-render-key>"
gh secret set RENDER_SERVICE_ID --body "<prod-service-id>"
gh secret set VERCEL_TOKEN --body "<prod-vercel-token>"
gh secret set VERCEL_ORG_ID --body "<prod-org-id>"
gh secret set VERCEL_PROJECT_ID --body "<prod-project-id>"
gh secret set BACKEND_URL --body "https://api.example.com"
gh secret set FRONTEND_URL --body "https://app.example.com"
gh secret set BACKEND_URL_STAGING --body "https://staging-api.example.com"
gh secret set FRONTEND_URL_STAGING --body "https://staging-app.example.com"
gh secret set SENTRY_DSN --body "<backend-sentry-dsn>"
gh secret set VITE_SENTRY_DSN --body "<frontend-sentry-dsn>"
```
Replicate staging variants as needed. After adding secrets, re-run workflows.

### Secrets Reference Table
| Secret | Purpose | Environment |
|--------|---------|-------------|
| RENDER_SERVICE_ID | Render service ID | production |
| RENDER_API_KEY | Render API key | production |
| RAILWAY_TOKEN | Railway token fallback deploy | production |
| BACKEND_URL | Production backend base URL | production |
| VERCEL_TOKEN | Vercel deployment token | production |
| VERCEL_ORG_ID | Vercel org scope | production |
| VERCEL_PROJECT_ID | Vercel project id | production |
| FRONTEND_URL | Production frontend URL | production |
| MONGODB_URI_PROD | MongoDB Atlas connection string | production |
| SENTRY_DSN | Backend Sentry DSN (prod) | production |
| VITE_SENTRY_DSN | Frontend Sentry DSN (prod) | production |
| RAILWAY_TOKEN_STAGING | Railway token staging | staging |
| BACKEND_URL_STAGING | Staging backend base URL | staging |
| VERCEL_TOKEN_STAGING | Vercel token staging | staging |
| VERCEL_ORG_ID_STAGING | Vercel org staging | staging |
| VERCEL_PROJECT_ID_STAGING | Vercel project staging | staging |
| FRONTEND_URL_STAGING | Staging frontend URL | staging |
| MONGODB_URI_STAGING | Staging MongoDB URI | staging |
| SENTRY_DSN_STAGING | Backend Sentry DSN staging | staging |
| VITE_SENTRY_DSN_STAGING | Frontend Sentry DSN staging | staging |

### Sentry Integration
Backend: Initialized in `backend/src/app.js` (request & error handlers added when `SENTRY_DSN` set). Frontend: `frontend/src/sentry.js` initializes early; web vitals forwarded as breadcrumbs via `src/performance.js`.

### Screenshots (Add Before Submission)
Store evidence under `docs/screenshots/`:
| File | Content |
|------|---------|
| app.png | Production frontend homepage |
| health.png | JSON from `/api/health` |
| metrics.png | Snippet from `/api/metrics` or dashboard |
| ci-run.png | Successful CI workflow summary |
| sentry.png | Sentry event list or trace |
| local-app.png | Local frontend via compose (captured manually) |
| local-health.png | Local health endpoint response |
| local-metrics.png | Local metrics endpoint sample |

### Security Audit Guidance
Run: `npm audit` in both `backend` and `frontend`. Address high/critical immediately. For moderate dev-only issues document justification if not patched. Avoid `npm audit fix --force` unless change is reviewed. Add an audit step / filter to CI as enhancement.

### Docker Installation
If Docker is missing locally:
```bash
sudo apt-get update
sudo apt-get install -y docker.io
sudo systemctl enable --now docker
sudo usermod -aG docker "$USER"  # re-login for group membership
```
Then start services:
```bash
docker compose up --build
```
Re-login or use `sudo` if permission denied.

### First Deploy Checklist
1. Create staging branches (`git checkout -b staging && git push origin staging`).
2. Add staging secrets above.
3. Push to `staging` → verify staging CD jobs succeed.
4. Confirm health: `curl $BACKEND_URL_STAGING/api/health` returns `ok`.
5. Push to `main` after review → production deploy workflows run.
6. Validate production health & homepage.
7. Update URLs below.

### Live URLs & Screenshots
Update after first successful production deploy:
- Backend API: `https://api.example.com/api/health`
- Frontend App: `https://app.example.com/`
- Metrics Endpoint (protected/internal): `https://api.example.com/api/metrics`
- Uptime Dashboard: `docs/screenshots/uptime.png`
- CI Pipeline Screenshot: `docs/screenshots/ci.png`
- Deployment Screenshot: `docs/screenshots/deploy.png`
- Sentry Dashboard Screenshot: `docs/screenshots/sentry.png`

Place image files in `docs/screenshots/` and commit.

### Screenshot Capture Commands (Examples)
```
# Using Chrome headless (if needed locally)
chrome --headless --disable-gpu --screenshot=docs/screenshots/ci.png https://github.com/<org>/<repo>/actions
```


## TODO: Provide Production URLs
Update after deployment:
- Backend API: `https://your-backend-host/api/health`
- Frontend App: `https://your-frontend-host/`
- CI/CD Screenshots: `docs/screenshots/*`
- Monitoring Dashboard: Add link (e.g., Render metrics / Sentry project)

## Contributing / Next Steps
- Add authentication (JWT) & input validation (Zod / Joi).
- Expand test coverage (error paths, metrics presence, React components).
- Add end-to-end tests (Playwright) for critical flows.
- Add build cache & artifact retention policy.
- Integrate Slack / Teams notifications for failed deployments.

---
This scaffold demonstrates core deployment & DevOps concepts for the Week 7 assignment. Replace placeholders with real platform commands and secrets before production.

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Render Documentation](https://render.com/docs)
- [Railway Documentation](https://docs.railway.app/)
- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com/) 