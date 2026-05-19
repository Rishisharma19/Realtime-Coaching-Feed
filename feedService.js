const Feed = require("../models/Feed");
const { getRedis, isRedisReady } = require("../config/redis");

const CACHE_KEY = "feed:all";
const CACHE_TTL = 60; // seconds

const getCache = async (key) => {
  if (!isRedisReady()) return null;
  try {
    const data = await getRedis().get(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

const setCache = async (key, value, ttl = CACHE_TTL) => {
  if (!isRedisReady()) return;
  try {
    await getRedis().setex(key, ttl, JSON.stringify(value));
  } catch {}
};

const invalidateAllFeedCaches = async () => {
  if (!isRedisReady()) return;
  try {
    const keys = await getRedis().keys(`${CACHE_KEY}:*`);
    if (keys.length > 0) await getRedis().del(...keys);
  } catch {}
};

const getAllFeeds = async ({ page = 1, limit = 20, category } = {}) => {
  const cacheKey = `${CACHE_KEY}:${category || "all"}:${page}:${limit}`;

  const cached = await getCache(cacheKey);
  if (cached) return { ...cached, fromCache: true };

  const query = category ? { category } : {};
  const skip = (page - 1) * limit;

  const [feeds, total] = await Promise.all([
    Feed.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Feed.countDocuments(query),
  ]);

  const result = {
    feeds,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasMore: skip + feeds.length < total },
    fromCache: false,
  };

  await setCache(cacheKey, result);
  return result;
};

const createFeed = async (feedData) => {
  const feed = await Feed.create(feedData);
  await invalidateAllFeedCaches();
  return feed;
};

module.exports = { getAllFeeds, createFeed };
