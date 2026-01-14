# GitHub Copilot Instructions for Quartz Control Center

You are an expert developer working on the **Quartz Control Center** project.
This repository contains a monorepo with:
- **API**: Express/Node.js (`apps/api`)
- **Web**: Next.js (`apps/web`)
- **Desktop**: Electron (`apps/desktop`)

## Primary Rules

1.  **Sync API & UI Changes**
    - When suggesting changes to the **API** (endpoints, data models), ALWAYS consider the impact on the **Web** and **Desktop** clients.
    - Suggest corresponding updates to frontend types or service calls if an API contract changes.
    - Example: "You added `GET /jobs`. Should we add a `getJobs` function in `apps/web/src/api/jobs.ts`?"

2.  **Release Workflow**
    - Identify when a version number is bumped in `package.json`.
    - Remind the user or suggest steps related to creating a **GitHub Release**.
    - For Desktop, ensure electron-builder config matches the new version.

3.  **Code Quality**
    - Adhere to **Clean Code** principles.
    - Use strict TypeScript types.
    - For UI, suggest modern, aesthetic components (Tailwind classes).

4.  **Database**
    - Ensure SQL queries or schema changes support PostgreSQL, MySQL, and SQL Server.
