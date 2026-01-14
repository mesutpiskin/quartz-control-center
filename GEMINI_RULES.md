# PROMPT RULES for GEMINI (Quartz Control Center)

## Project Overview
You are working on **Quartz Control Center**, a monorepo managing Quartz Scheduler jobs.
- **Stack**: TypeScript, Node.js, Express (API), Next.js (Web), Electron (Desktop).
- **Multi-DB**: Postgres, MySQL, SQL Server.

## Mandatory Guidelines

### 1. Feature Parity (API <-> UI)
- **Rule**: Any functional change in the `apps/api` must be reflected in `apps/web` and `apps/desktop`.
- **Instruction**: If I ask you to "Add a job trigger endpoint", you must also ask or offer to implement the UI button/form to invoke it in the frontend apps.
- **Context**: The desktop app wraps the web app logic but has native capabilities.

### 2. Release Protocol
- **Rule**: Version increments = Release candidates.
- **Instruction**: If `package.json` version changes, check if `apps/desktop/package.json` needs a sync and remind me to "Draft a Release".

### 3. Design & Architecture
- **UI**: High-quality, modern aesthetics. No generic Bootstrap-looking UI.
- **Code**: SOLID principles.
- **Docs**: Use Swagger/OpenAPI decorators on all API Controllers.

## File Structure
- `apps/api`: Backend logic.
- `apps/web`: Frontend dashboard.
- `apps/desktop`: Native wrapper.
