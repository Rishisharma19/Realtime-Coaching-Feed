# Realtime Coaching Feed

A full-stack realtime coaching feed application built with Node.js, Express, Next.js, MongoDB, Redis, and Socket.IO.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js Frontend                      │
│   Home Page (feed viewer)   Admin Page (feed poster)     │
│         ↕ REST API               ↕ REST API              │
│         ↕ Socket.IO events       ↕ Socket.IO events      │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│              Express Backend (Node.js)                   │
│                                                          │
│  GET /api/feed  ──→  Redis Cache ──→ MongoDB (fallback)  │
│  POST /api/feed ──→  MongoDB     ──→ Invalidate Cache    │
│                        ↓                                 │
│                   Socket.IO emit("new_feed")             │
└─────────────────────────────────────────────────────────┘
```

## Quick Start

### Option 1: Docker (recommended)

```bash
# Copy env files
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local

# Start everything
docker-compose up --build
```

App runs at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000

---

### Option 2: Local Development

**Prerequisites:** MongoDB, Redis, Node.js 18+

**Backend:**
```bash
cd backend
npm install
cp .env.example .env   # Edit if needed
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

---

## API Reference

### GET /api/feed
Returns paginated feed list. Redis-cached (60s TTL).

**Query params:**
| Param    | Type   | Default | Description           |
|----------|--------|---------|-----------------------|
| page     | number | 1       | Page number           |
| limit    | number | 20      | Items per page (max 50)|
| category | string | -       | Filter by category     |

**Response headers:**
- `X-Cache: HIT | MISS` — cache status
- `X-Cache-Backend: redis | disabled` — cache backend

**Response:**
```json
{
  "success": true,
  "feeds": [...],
  "pagination": { "page": 1, "limit": 20, "total": 42, "totalPages": 3, "hasMore": true },
  "fromCache": true
}
```

---

### POST /api/feed
Creates a new feed item, invalidates Redis cache, and emits `new_feed` Socket.IO event.

**Body:**
```json
{
  "title": "Today's Sprint Drill",
  "content": "Focus on knee drive for the first 30m...",
  "author": "Coach Riya",
  "category": "technique",
  "tags": ["sprint", "technique"]
}
```

Valid categories: `motivation`, `technique`, `nutrition`, `mindset`, `recovery`, `general`

---

### GET /api/feed/health
Returns service health status.

```json
{
  "services": { "mongodb": "connected", "redis": "connected" }
}
```

---

## Socket.IO Events

| Event          | Direction        | Payload                    | Description                        |
|----------------|------------------|----------------------------|------------------------------------|
| `new_feed`     | server → client  | `{ feed: FeedObject }`     | New feed item created               |
| `client_count` | server → client  | `{ count: number }`        | Total connected viewers             |
| `ping_server`  | client → server  | -                          | Heartbeat                           |
| `pong_server`  | server → client  | `{ timestamp: number }`    | Heartbeat response                  |

---

## Key Design Decisions

### Redis Caching Strategy
- Cache key: `feed:all:<category>:<page>:<limit>` — scoped per query
- TTL: 60 seconds
- On `POST /feed`: all `feed:*` cache keys are deleted (full invalidation)
- Graceful fallback: if Redis is unavailable, all reads go directly to MongoDB

### Socket.IO Realtime Updates
- Server emits `new_feed` on every successful POST
- Frontend prepends new feeds **without a full page refresh**
- Connection state recovery: reconnecting clients catch up within 2 minutes of disconnect
- Duplicate event dedup: `seenEventIds` ref prevents same event rendering twice (e.g., on React StrictMode double-mounts or unstable connections)
- On reconnect: triggers a full feed refresh to catch any missed items

### Error Handling
- All routes use `try/catch` with central `errorHandler` middleware
- Mongoose validation errors are translated to 400 responses with field-level details
- Frontend shows inline error banners with retry buttons
- Loading skeletons prevent layout shift

---

## Project Structure

```
syncup/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js          # MongoDB connection
│   │   │   └── redis.js       # Redis client with graceful fallback
│   │   ├── middleware/
│   │   │   ├── errorHandler.js # Central error handler
│   │   │   └── validate.js    # Request validation
│   │   ├── models/
│   │   │   └── Feed.js        # Mongoose schema
│   │   ├── routes/
│   │   │   └── feed.js        # GET + POST /api/feed
│   │   ├── services/
│   │   │   └── feedService.js # Business logic + cache layer
│   │   └── server.js          # Express + Socket.IO server
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.jsx       # Home — feed viewer
│   │   │   └── admin/
│   │   │       └── page.jsx   # Admin — post updates
│   │   ├── components/
│   │   │   ├── FeedCard.jsx   # Feed item card
│   │   │   ├── SkeletonCard.jsx # Loading placeholder
│   │   │   └── StatusBar.jsx  # Socket/cache status
│   │   ├── hooks/
│   │   │   └── useFeed.js     # Feed data + socket hook
│   │   └── lib/
│   │       ├── api.js         # REST API client
│   │       └── socket.js      # Singleton Socket.IO client
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml
└── README.md
```

---

## Scalability Notes

- **Horizontal scaling**: Socket.IO should use `@socket.io/redis-adapter` to share events across multiple backend instances
- **Cache TTL tuning**: 60s is conservative; adjust based on write frequency
- **MongoDB indexing**: `createdAt` and `category` indexes are set for query performance
- **Rate limiting**: Add `express-rate-limit` per IP for the POST endpoint in production
- **Authentication**: Admin page should be protected with JWT/session auth before production use
