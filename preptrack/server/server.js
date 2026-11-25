const dotenv = require('dotenv');
const { execSync } = require('child_process');

// Load environment variables before any other imports
dotenv.config();

const app = require('./app');
const connectDB = require('./config/db');

// Connect to MongoDB
connectDB();

const PORT = process.env.PORT || 5000;

// Ensure port is completely free on Windows (prevents EADDRINUSE from orphaned processes)
if (process.platform === 'win32') {
  try {
    const netstatOut = execSync(`netstat -ano | findstr :${PORT}`).toString();
    const lines = netstatOut.trim().split('\n');
    for (const line of lines) {
      if (!line.includes('LISTENING')) continue;
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && pid !== '0' && pid !== String(process.pid)) {
        try {
          execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
          console.log(`[SERVER] Automatically freed port ${PORT} from previous PID ${pid}`);
        } catch (_) {}
      }
    }
  } catch (_) {
    // Port is already free
  }
}

const server = app.listen(PORT, () => {
  console.log(`PrepTrack Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

// Handle listen errors gracefully (e.g. port already in use)
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`[SERVER] Port ${PORT} is already in use by another process.`);
    console.error(`[SERVER] Tip: Run 'taskkill /F /IM node.exe' if an orphaned process is holding port ${PORT}.`);
    process.exit(1);
  } else {
    console.error('[SERVER] Server error:', err.message);
    process.exit(1);
  }
});

// Clean socket shutdown on nodemon restart (SIGUSR2)
process.once('SIGUSR2', () => {
  server.close(() => {
    process.kill(process.pid, 'SIGUSR2');
  });
});

process.on('SIGINT', () => {
  server.close(() => {
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  server.close(() => {
    process.exit(0);
  });
});

// Handle unhandled promise rejections gracefully
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
  server.close(() => process.exit(1));
});
