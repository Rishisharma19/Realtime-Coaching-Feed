require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const connectDB = require("./config/db");
const { connectRedis } = require("./config/redis");
const feedRouter = require("./routes/feed");
const { errorHandler, notFound } = require("./middleware/errorHandler");

const PORT = process.env.PORT || 4000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

// ─── App & HTTP Server ────────────────────────────────────────────────────────
const app = express();
const httpServer = http.createServer(app);

// ─── Socket.IO Setup ──────────────────────────────────────────────────────────
const io = new Server(httpServer, {
  cors: { origin: CLIENT_URL, methods: ["GET", "POST"] },
  // Prevent duplicate events: use connection state recovery
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
    skipMiddlewares: true,
  },
});

// Track connected clients (for observability)
let connectedClients = 0;

io.on("connection", (socket) => {
  connectedClients++;
  console.log(`🔌 Client connected [${socket.id}] — total: ${connectedClients}`);

  // Send current connected count to all
  io.emit("client_count", { count: connectedClients });

  // Handle client subscribing to a specific category room
  socket.on("subscribe_category", (category) => {
    socket.join(`category:${category}`);
    console.log(`   └── ${socket.id} subscribed to category: ${category}`);
  });

  socket.on("unsubscribe_category", (category) => {
    socket.leave(`category:${category}`);
  });

  socket.on("disconnect", (reason) => {
    connectedClients = Math.max(0, connectedClients - 1);
    console.log(`🔌 Client disconnected [${socket.id}] reason: ${reason} — total: ${connectedClients}`);
    io.emit("client_count", { count: connectedClients });
  });

  // Heartbeat to detect stale connections
  socket.on("ping_server", () => {
    socket.emit("pong_server", { timestamp: Date.now() });
  });
});

// Attach io to app so routes can access it
app.set("io", io);

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, _res, next) => {
  console.log(`→ ${req.method} ${req.path}`);
  next();
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/feed", feedRouter);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", uptime: process.uptime(), connectedClients });
});

app.use(notFound);
app.use(errorHandler);

// ─── Startup ─────────────────────────────────────────────────────────────────
const start = async () => {
  await connectDB();
  connectRedis();

  httpServer.listen(PORT, () => {
    console.log(`\n🚀 SyncUp backend running on http://localhost:${PORT}`);
    console.log(`   Socket.IO ready — accepting connections from ${CLIENT_URL}\n`);
  });
};

start();
