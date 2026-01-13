<div align="center">
  <br />
  <img src="apps/web/public/logo.png" alt="Quartz Control Center Logo" width="120" height="120" />
  <br />
  <h1 align="center">Quartz Control Center</h1>

  <p align="center">
    <strong>Enterprise-grade management interface for Quartz Scheduler</strong>
  </p>

  <p align="center">
    <a href="https://github.com/mesutpiskin/quartz-control-center/releases">
      <img src="https://img.shields.io/github/v/release/mesutpiskin/quartz-control-center?style=flat-square&color=2563EB" alt="Release" />
    </a>
    <a href="https://github.com/mesutpiskin/quartz-control-center/blob/main/LICENSE">
      <img src="https://img.shields.io/badge/License-MIT-yellow?style=flat-square" alt="License" />
    </a>
    <a href="https://www.typescriptlang.org/">
      <img src="https://img.shields.io/badge/TypeScript-Ready-blue?style=flat-square&logo=typescript" alt="TypeScript" />
    </a>
    <a href="https://www.electronjs.org/">
      <img src="https://img.shields.io/badge/Electron-Desktop-purple?style=flat-square&logo=electron" alt="Electron" />
    </a>
    <a href="https://nextjs.org/">
      <img src="https://img.shields.io/badge/Next.js-Web-black?style=flat-square&logo=next.js" alt="Next.js" />
    </a>
  </p>
  
  <br />
</div>

## 📋 Overview

**Quartz Control Center** is a robust, standalone management interface designed for enterprise applications using **Quartz Scheduler**. 

It eliminates the need for maintaining custom-built management UIs or running heavy Java-based tools just to inspect your scheduled tasks. By connecting directly to your persistence layer, it provides a centralized dashboard to visualize, monitor, and control your job execution environment in real-time.

### Key Capabilities
*   **Centralized Management:** Manage jobs and triggers across multiple environments (Dev, Test, Prod) from a single interface.
*   **Real-time Observability:** Monitor currently executing jobs and visualize load.
*   **Cross-Database Support:** Native support for PostgreSQL, Microsoft SQL Server, and MySQL.
*   **Deployment Flexibility:** Run as a native **Desktop App** (macOS) or as a containerized **Web Service** (Docker).



## Screenshots

<div align="center">
  <img src="/docs/images/quartz_dashboard_ss.png" alt="Quartz Control Center Dashboard" width="800" style="border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); border: 1px solid rgba(0,0,0,0.1);" />
</div>


## Installation

### Desktop Application
The easiest way to get started. A self-contained Electron application that runs locally.

#### macOS (Apple Silicon)
[![Download for macOS](https://img.shields.io/badge/Download-macOS_(Apple_Silicon)-white?style=for-the-badge&logo=apple)](https://github.com/mesutpiskin/quartz-control-center/releases/latest)

1.  Download the `.dmg` file from the [Releases Page](https://github.com/mesutpiskin/quartz-control-center/releases/latest).
2.  Open the file and drag **Quartz Control Center** to your Applications folder.

#### Windows (x64 / ARM64)
[![Download for Windows](https://img.shields.io/badge/Download-Windows-blue?style=for-the-badge&logo=windows)](https://github.com/mesutpiskin/quartz-control-center/releases/latest)

1.  Download the `.exe` file from the [Releases Page](https://github.com/mesutpiskin/quartz-control-center/releases/latest).
2.  Run the installer (`Quartz Control Center-Setup.exe`).


### Docker
Ideal for shared team environments or hosted deployments.

```bash
git clone https://github.com/mesutpiskin/quartz-control-center.git
cd quartz-control-center
docker-compose up -d
```
Access the dashboard at `http://localhost:3000`.

### Development
```bash
npm install
npm run dev
```
Open http://localhost:3000 in your browser.

---

## Architecture & Tech Stack

The project is built as a monorepo using modern web technologies, ensuring performance and extensibility.

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | [Next.js 14](https://nextjs.org/) | React framework for the UI, ensuring fast rendering and static export capabilities. |
| **Backend** | [Express.js](https://expressjs.com/) | API layer handling database connections and Quartz SQL queries. |
| **Desktop** | [Electron](https://www.electronjs.org/) | Wraps the web app and API into a native executable. |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) | Utility-first CSS framework for a consistent, modern design system. |
| **State** | [React Query](https://tanstack.com/query) | Efficient server state management and caching. |

---

## Configuration

### Environment Variables
When running as a web service or in development, you can configure the application using `.env` files.

**API (`apps/api/.env`)**
```env
PORT=3001
CORS_ORIGIN=http://localhost:3000
NODE_ENV=production
```

**Web (`apps/web/.env`)**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```


---

<div align="center">
<p>  if you like this project, please give a star on GitHub. </p>
<p><i>Special thanks to <a href="https://github.com/quartz-scheduler/quartz">Quartz Scheduler</a></i></p>
</div>

