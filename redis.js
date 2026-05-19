const Redis = require("ioredis");

let redisClient = null;
let isRedisConnected = false;

const connectRedis = () => {
  try {
    redisClient = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
      lazyConnect: true,
      retryStrategy: (times) => {
        if (times > 3) {
          console.warn("⚠️  Redis unavailable — caching disabled, running without cache.");
          return null; // Stop retrying
        }
        return Math.min(times * 200, 2000);
      },
      enableOfflineQueue: false,
      maxRetriesPerRequest: 1,
    });

    redisClient.on("connect", () => {
      isRedisConnected = true;
      console.log("✅ Redis connected");
    });

    redisClient.on("error", (err) => {
      isRedisConnected = false;
      // Suppress after first error
    });

    redisClient.on("close", () => {
      isRedisConnected = false;
    });

    redisClient.connect().catch(() => {});
  } catch (err) {
    console.warn("⚠️  Redis init failed:", err.message);
  }

  return redisClient;
};

const getRedis = () => redisClient;
const isRedisReady = () => isRedisConnected;

module.exports = { connectRedis, getRedis, isRedisReady };
