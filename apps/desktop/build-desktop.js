const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Desktop Build Process...');

const rootDir = path.resolve(__dirname, '../../');
const webDir = path.join(rootDir, 'apps/web');
const desktopDir = __dirname;

// 1. Build Web App (Static Export)
console.log('\n📦 Building Web App (Next.js Export)...');
try {
    execSync('npm run build', { cwd: webDir, stdio: 'inherit' });
    
    // Copy export to desktop 'dist-web'
    const outDir = path.join(webDir, 'out');
    const destDir = path.join(desktopDir, 'dist-web');
    
    if (fs.existsSync(destDir)) {
        fs.rmSync(destDir, { recursive: true, force: true });
    }
    fs.cpSync(outDir, destDir, { recursive: true });
    console.log('✅ Web App Built and Copied to dist-web');

    // Ensure icon exists for electron-builder
    const iconSource = path.join(webDir, 'public/logo.png');
    const iconDestDir = path.join(desktopDir, 'build');
    if (!fs.existsSync(iconDestDir)) {
        fs.mkdirSync(iconDestDir, { recursive: true });
    }
    fs.copyFileSync(iconSource, path.join(iconDestDir, 'icon.png'));
    console.log('✅ App Icon setup in build/icon.png');
} catch (error) {
    console.error('❌ Web Build Failed:', error);
    process.exit(1);
}

// 2. Compile Electron & API Typescript
console.log('\n🔨 Compiling Electron & Embedded API...');
try {
    // Copy API source code to desktop source to handle imports locally
    const apiSourceDir = path.join(rootDir, 'apps/api/src');
    const embeddedApiDir = path.join(desktopDir, 'src/api_embedded');
    
    if (fs.existsSync(embeddedApiDir)) {
        fs.rmSync(embeddedApiDir, { recursive: true, force: true });
    }
    fs.cpSync(apiSourceDir, embeddedApiDir, { recursive: true });
    console.log('✅ API Source code copied to src/api_embedded');

    // Clean dist folder to ensure fresh compilation
    const distDir = path.join(desktopDir, 'dist');
    if (fs.existsSync(distDir)) {
        fs.rmSync(distDir, { recursive: true, force: true });
        console.log('🧹 Cleaned stale dist folder');
    }

    execSync('npm run compile', { cwd: desktopDir, stdio: 'inherit' });
    console.log('✅ Electron Main Process Compiled');
} catch (error) {
    console.error('❌ Electron Compilation Failed:', error);
    process.exit(1);
}

// 3. Package with Electron Builder
console.log('\n💿 Packaging Application...');
try {
    const args = process.argv.slice(2);
    let buildCommand = 'npx electron-builder build';
    
    if (args.includes('--win')) {
        buildCommand += ' --win';
    } else if (args.includes('--all')) {
        buildCommand += ' --mac --win';
    } else {
        // Default to mac if on mac and no specific target
        buildCommand += ' --mac';
    }

    console.log(`> Running: ${buildCommand}`);
    execSync(buildCommand, { cwd: desktopDir, stdio: 'inherit' });
    console.log('✅ Application Packaged Successfully! Check apps/desktop/dist-electron');
} catch (error) {
    console.error('❌ Packaging Failed:', error);
    process.exit(1);
}
