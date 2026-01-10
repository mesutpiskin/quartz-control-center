# Quartz Control Center

<div align="center">

![Quartz Control Center](https://img.shields.io/badge/Quartz-Control_Center-blue?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supported-blue?style=for-the-badge&logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-Ready-blue?style=for-the-badge&logo=docker)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

**Modern web-based management interface for Quartz Scheduler**

[Features](#-features) • [Quick Start](#-quick-start) • [Docker](#-docker-deployment) • [Documentation](#-documentation) • [Screenshots](#-screenshots)

</div>

---

## 📋 Overview

Quartz Control Center is a powerful, modern web application that provides a comprehensive management interface for Quartz Scheduler databases. Connect to your existing Quartz databases and manage jobs, triggers, and monitor execution in real-time through an intuitive, premium UI.

### Key Highlights

- 🔌 **Zero Scheduler Dependency** - Connect to existing Quartz databases without running a separate scheduler
- �️ **Multi-Database Support** - Manage multiple database connections with profile switching
- 📊 **Real-time Monitoring** - Watch job execution with auto-refresh capabilities
- 🎨 **Premium UI** - Modern, responsive design with dark mode support
- 🐳 **Docker Ready** - One-command deployment with Docker Compose
- 💾 **Profile Management** - Export/import connection profiles for backup and sharing

---

## ✨ Features

### Connection Management
- **Multi-Profile Support** - Save and manage multiple database connection profiles
- **Quick Switching** - Switch between databases with a single click
- **Export/Import** - Backup and share connection profiles via JSON
- **Schema Detection** - Automatic detection of Quartz tables in your database
- **Connection Validation** - Test connections before saving

### Job Management
- **Comprehensive Job List** - View all jobs with detailed information
- **Advanced Search** - Filter jobs by name, group, or class
- **Group Filtering** - Filter jobs by job group
- **Job Properties** - View durable, non-concurrent, and recovery flags
- **Delete Jobs** - Remove jobs with confirmation dialogs

### Trigger Management
- **Trigger Overview** - View all triggers with cron expressions
- **State Indicators** - Color-coded states (WAITING, PAUSED, ACQUIRED, BLOCKED)
- **Fire Time Tracking** - See next and previous fire times
- **Pause/Resume** - Control trigger execution on the fly
- **Cron Display** - Clear visualization of cron schedules

### Monitoring
- **Real-time Execution View** - Monitor currently running jobs
- **Auto-refresh** - Configurable 5-second auto-refresh
- **Running Duration** - See how long jobs have been executing
- **Instance Information** - View which scheduler instance is running the job

### Scheduler Information
- **Statistics Dashboard** - Total jobs, triggers, executing, and paused counts
- **Instance Details** - View all scheduler instances
- **Check-in Monitoring** - Track last check-in times and intervals
- **Health Status** - Visual indicators for scheduler health

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18 or higher
- **PostgreSQL** database with Quartz tables
- **npm** or **yarn** package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/mesutpiskin/quartz-control-center.git
   cd quartz-control-center
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Configure Backend** (Optional)
   ```bash
   cp .env.example .env
   # Edit .env if you need to change default settings
   ```

4. **Start Backend**
   ```bash
   npm run dev
   # Backend runs on http://localhost:3001
   ```

5. **Install Frontend Dependencies** (in a new terminal)
   ```bash
   cd frontend
   npm install
   ```

6. **Start Frontend**
   ```bash
   npm run dev
   # Frontend runs on http://localhost:3000
   ```

7. **Open Your Browser**
   
   Navigate to `http://localhost:3000` and configure your first database connection!

---

## 🐳 Docker Deployment

### Using Docker Compose (Recommended)

The easiest way to run Quartz Control Center is with Docker Compose:

```bash
# Build and start both services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Access the application at `http://localhost:3000`

### Manual Docker Build

**Backend:**
```bash
cd backend
docker build -t quartz-control-center-backend .
docker run -p 3001:3001 quartz-control-center-backend
```

**Frontend:**
```bash
cd frontend
docker build -t quartz-control-center-frontend .
docker run -p 3000:3000 quartz-control-center-frontend
```

---

## 📖 Documentation

### Configuration

#### Backend Environment Variables

```bash
PORT=3001                          # API server port
CORS_ORIGIN=http://localhost:3000  # Frontend origin
NODE_ENV=development               # Environment mode
```

#### Frontend Environment Variables

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001  # Backend API URL
```

### Database Connection

1. Navigate to **Settings** page
2. Enter your PostgreSQL connection details:
   - **Host**: Database server address
   - **Port**: Database port (default: 5432)
   - **Database**: Database name
   - **Username**: Database username
   - **Password**: Database password
   - **Schema**: Schema containing Quartz tables
3. Click **Test Connection**
4. Select the schema with Quartz tables
5. Click **Save Profile**

### Managing Profiles

- **Add Profile**: Click "New Profile" button
- **Switch Profile**: Click on any saved profile card
- **Delete Profile**: Click the trash icon on profile card
- **Export All**: Click "Export" to download JSON file
- **Import**: Click "Import" and select a JSON file

---

## 🏗️ Architecture

### Tech Stack

**Backend (Node.js/Express)**
- Express.js for REST API
- PostgreSQL client (pg) for database connectivity
- TypeScript for type safety
- CORS middleware for cross-origin requests

**Frontend (Next.js 14)**
- React 18 with TypeScript
- Next.js 14 with App Router
- Tailwind CSS for styling
- React Query for data fetching
- Lucide React for icons

### Project Structure

```
quartz-control-center/
├── backend/                 # Node.js/Express API
│   ├── src/
│   │   ├── db/             # Database connection management
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # TypeScript interfaces
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Business logic
│   │   └── index.ts        # Express app entry
│   ├── Dockerfile
│   └── package.json
│
├── frontend/               # Next.js 14 App
│   ├── src/
│   │   ├── app/           # Next.js pages
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utilities and types
│   ├── Dockerfile
│   └── package.json
│
└── docker-compose.yml      # Docker Compose configuration
```

---

## 🔌 API Endpoints

### Database Management
- `POST /api/database/test-connection` - Test database connectivity
- `POST /api/database/schemas` - List all schemas
- `POST /api/database/schemas-with-quartz` - Detect Quartz tables
- `POST /api/database/validate-quartz` - Validate Quartz table structure

### Job Management
- `POST /api/jobs/list` - List all jobs
- `POST /api/jobs/detail` - Get job details
- `POST /api/jobs/delete` - Delete a job

### Trigger Management
- `POST /api/triggers/list` - List all triggers
- `POST /api/triggers/executing` - Get executing jobs
- `POST /api/triggers/pause` - Pause a trigger
- `POST /api/triggers/resume` - Resume a trigger

### Scheduler Information
- `POST /api/scheduler/info` - Get scheduler instances
- `POST /api/scheduler/statistics` - Get comprehensive statistics

---

## 🔐 Security Notes

⚠️ **Important**: The current version stores database credentials in browser localStorage for development/demo purposes.

**For production use, implement:**
- Server-side session management
- Encrypted credential storage
- Authentication and authorization layer
- HTTPS/TLS encryption
- Network segmentation

---

## 🗺️ Roadmap

- [ ] SQL Server support
- [ ] MySQL support
- [ ] Job creation and editing UI
- [ ] Trigger creation with visual cron builder
- [ ] Job execution history
- [ ] Export/import job configurations
- [ ] User authentication system
- [ ] Role-based access control (RBAC)
- [ ] Audit logging
- [ ] Email notifications for job failures
- [ ] Grafana/Prometheus integration

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with [Quartz Scheduler](http://www.quartz-scheduler.org/)
- UI inspired by modern enterprise dashboards
- Icons by [Lucide](https://lucide.dev/)

---

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/mesutpiskin/quartz-control-center/issues) page
2. Create a new issue with detailed information
3. Reach out on LinkedIn

---

<div align="center">

**⭐ Star this repository if you find it useful!**

</div>
