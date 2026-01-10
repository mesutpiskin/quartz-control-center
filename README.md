# Quartz Control Center

<div align="center">

![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supported-blue?style=flat-square&logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-Ready-blue?style=flat-square&logo=docker)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

**Modern web-based management interface for Quartz Scheduler**

Connect to your existing Quartz databases and manage jobs, triggers, and monitor execution in real-time.

[Quick Start](#-quick-start) • [Docker](#-docker) • [Features](#-features) • [Roadmap](#-roadmap)

</div>

---

## 📋 What is it?

Quartz Control Center is a standalone web application that lets you **manage your Quartz Scheduler databases** without running a separate scheduler instance. Simply connect to your existing PostgreSQL database and:

- ✅ View and manage jobs
- ✅ Control triggers (pause/resume)
- ✅ Monitor executing jobs in real-time
- ✅ Manage multiple database connections
- ✅ Export/import connection profiles

## 🚀 Quick Start

### Option 1: Docker Compose (Recommended)

```bash
git clone https://github.com/mesutpiskin/quartz-control-center.git
cd quartz-control-center
docker-compose up -d
```

Open `http://localhost:3000` and configure your database connection.

### Option 2: Development Mode

```bash
# Clone and install
git clone https://github.com/mesutpiskin/quartz-control-center.git
cd quartz-control-center
npm install

# Start API (Terminal 1)
npm run api:dev

# Start Web (Terminal 2)
npm run web:dev
```

Open `http://localhost:3000`

## 🐳 Docker

### Build and Run

```bash
# Using Docker Compose
docker-compose up -d

# Or build manually
docker build -f docker/api/Dockerfile -t qcc-api .
docker build -f docker/web/Dockerfile -t qcc-web .
```

### Environment Variables

**API** (`apps/api/.env`):
```bash
PORT=3001
CORS_ORIGIN=http://localhost:3000
NODE_ENV=production
```

**Web**:
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## ⚙️ How It Works

1. **Connect**: Enter your PostgreSQL database credentials
2. **Detect**: Application automatically detects Quartz tables in your schema
3. **Manage**: View, control, and monitor your scheduled jobs through a modern UI

```
User Interface (Web)
        ↓
    API Layer
        ↓
Your PostgreSQL Database
        ↓
    QRTZ_* Tables
```

The application performs **direct SQL queries** to Quartz tables. No scheduler instance required.

## ✨ Features

### Connection Management
- **Multi-Profile Support** - Save multiple database connections
- **Quick Switching** - Switch between databases instantly
- **Export/Import** - Backup and share connection profiles

### Job Management
- View all jobs with search and filtering
- Delete jobs with cascade trigger removal
- Display job properties (durable, non-concurrent, recovery)

### Trigger Management
- View cron expressions and schedules
- Pause/resume triggers
- Color-coded states (WAITING, PAUSED, ACQUIRED, BLOCKED)
- Next/previous fire times

### Monitoring
- Real-time executing jobs view with auto-refresh
- Running duration tracking
- Scheduler instance information
- Comprehensive statistics dashboard

## 📁 Project Structure

```
quartz-control-center/
├── apps/
│   ├── api/              # Node.js/Express backend
│   └── web/              # Next.js frontend
├── packages/
│   └── shared-types/     # Shared TypeScript types
├── docker/               # Dockerfiles
├── docs/                 # Documentation
│   ├── api.md           # API endpoints
│   └── architecture.md  # Architecture details
└── scripts/             # Build scripts
```

## 🗺️ Roadmap

### Version 1.x (Current)
- [x] PostgreSQL support
- [x] Multi-database profile management
- [x] Job and trigger management
- [x] Real-time monitoring
- [x] Docker support

### Version 2.0
- [ ] **Database Support**
  - [ ] MySQL support
  - [ ] SQL Server support
- [ ] **Job Operations**
  - [ ] Create new jobs
  - [ ] Edit job properties
  - [ ] Manual job triggering
- [ ] **UI Enhancements**
  - [ ] Visual cron builder
  - [ ] Job execution history
  - [ ] Charts and graphs

### Version 3.0
- [ ] **Security**
  - [ ] User authentication
  - [ ] Role-based access control (RBAC)
  - [ ] Encrypted credential storage
- [ ] **Advanced Features**
  - [ ] Job templates
  - [ ] Bulk operations
  - [ ] Webhook notifications
  - [ ] Audit logging

### Future Considerations
- [ ] Grafana/Prometheus integration
- [ ] Multi-language support (i18n)
- [ ] Mobile app
- [ ] Cloud-hosted version

## 📖 Documentation

- [API Documentation](docs/api.md)
- [Architecture Overview](docs/architecture.md)

## 🔐 Security Note

⚠️ **Current version stores credentials in browser localStorage**. For production:
- Implement server-side session management
- Use encrypted credential storage
- Add authentication layer
- Enable HTTPS/TLS

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file

---

<div align="center">

**⭐ Star this repository if you find it useful!**

</div>
