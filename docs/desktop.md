# Desktop App Distribution

## Building the Desktop Application

The desktop version packages the entire application (API + Web) into a single executable.

### Prerequisites

- Node.js 18+
- For macOS builds: Xcode Command Line Tools
- For Windows builds: Windows OS (or cross-compilation tools)
- For Linux builds: Linux OS or Docker

### Quick Build

```bash
# Install dependencies
npm install

# Build for your current platform
./scripts/build-desktop.sh

# Or build for specific platform
./scripts/build-desktop.sh mac    # macOS .dmg
./scripts/build-desktop.sh win    # Windows .exe
./scripts/build-desktop.sh linux  # Linux AppImage, .deb, .rpm
```

### Manual Build Steps

1. **Build API and Web**
   ```bash
   npm run build -w apps/api
   npm run build -w apps/web
   ```

2. **Build Desktop App**
   ```bash
   cd apps/desktop
   npm install
   npm run build
   ```

3. **Output Location**
   ```
   apps/desktop/dist/
   ├── Quartz Control Center-1.0.0.dmg          # macOS
   ├── Quartz Control Center Setup 1.0.0.exe    # Windows
   └── quartz-control-center-1.0.0.AppImage     # Linux
   ```

### Development Mode

Run the desktop app in development:

```bash
cd apps/desktop
npm install
npm start
```

This will:
1. Start the backend API on port 3001
2. Start the frontend server on port 3000
3. Open Electron window pointing to localhost:3000

### Features

- ✅ **Auto-start Backend** - API starts automatically
- ✅ **System Tray** - Minimize to system tray
- ✅ **Single Executable** - Everything bundled in one app
- ✅ **Cross-platform** - macOS, Windows, Linux
- ✅ **No Installation Required** - Portable builds available

### File Sizes

Approximate installer sizes:

- **macOS DMG**: 150-200 MB
- **Windows EXE**: 100-150 MB  
- **Linux AppImage**: 120-180 MB

The size includes Electron runtime, Node.js, and your entire application.

### Code Signing (Optional)

For production distribution:

**macOS:**
```bash
export CSC_LINK=/path/to/certificate.p12
export CSC_KEY_PASSWORD=your-password
npm run build:mac
```

**Windows:**
```bash
export CSC_LINK=/path/to/certificate.pfx
export CSC_KEY_PASSWORD=your-password
npm run build:win
```

### Auto-Updates (Future)

To enable auto-updates, configure in `electron-builder.yml`:

```yaml
publish:
  provider: github
  owner: mesutpiskin
  repo: quartz-control-center
```

Then use `electron-updater` in the app to check for updates.

## Troubleshooting

### Build Fails

1. Ensure all dependencies are built:
   ```bash
   npm run build -w apps/api
   npm run build -w apps/web
   ```

2. Check Node.js version (must be 18+):
   ```bash
   node --version
   ```

3. Clear build cache:
   ```bash
   rm -rf apps/desktop/dist
   rm -rf apps/desktop/node_modules
   cd apps/desktop && npm install
   ```

### App Won't Start

Check logs:
- **macOS**: `~/Library/Logs/Quartz Control Center/main.log`
- **Windows**: `%USERPROFILE%\AppData\Roaming\Quartz Control Center\logs\main.log`
- **Linux**: `~/.config/Quartz Control Center/logs/main.log`

### Port Already in Use

The app uses ports 3001 (API) and 3000 (Web). If these are in use:

1. Close other instances of the app
2. Check for other services on these ports
3. Or modify ports in `apps/desktop/src/main.js`
