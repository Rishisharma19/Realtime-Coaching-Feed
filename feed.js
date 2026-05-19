const express = require("express");
const router = express.Router();
const { getAllFeeds, createFeed } = require("../services/feedService");
const { validateFeed } = require("../middleware/validate");
const { isRedisReady } = require("../config/redis");

// GET /api/feed
// Returns paginated feed list, Redis-cached
router.get("/", async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const category = req.query.category || null;

    const result = await getAllFeeds({ page, limit, category });

    res.set("X-Cache", result.fromCache ? "HIT" : "MISS");
    res.set("X-Cache-Backend", isRedisReady() ? "redis" : "disabled");

    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
});

// POST /api/feed
// Creates a new feed item, invalidates cache, emits socket event
router.post("/", validateFeed, async (req, res, next) => {
  try {
    const { title, content, author, category, tags } = req.body;

    const feed = await createFeed({
      title: title.trim(),
      content: content.trim(),
      author: author.trim(),
      category: category || "general",
      tags: Array.isArray(tags) ? tags.map((t) => t.trim()).filter(Boolean) : [],
    });

    // Emit realtime event via Socket.IO (io attached to req.app)
    const io = req.app.get("io");
    if (io) {
      io.emit("new_feed", { feed });
    }

    res.status(201).json({ success: true, feed });
  } catch (err) {
    next(err);
  }
});

// GET /api/feed/health - service health check
router.get("/health", (req, res) => {
  const mongoose = require("mongoose");
  res.json({
    success: true,
    services: {
      mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
      redis: isRedisReady() ? "connected" : "disconnected",
    },
  });
});

module.exports = router;
