const Redis = require('ioredis');

const SESSION_TTL = 2 * 60 * 60; // 2 hours in seconds

let redisClient = null;
let usingFallback = false;

// In-memory fallback (used when Redis is not configured / unavailable)
const memoryStore = new Map();

function getRedisClient() {
  if (redisClient) return redisClient;

  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    usingFallback = true;
    return null;
  }

  redisClient = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: true,
    connectTimeout: 5000,
    retryStrategy: (times) => {
      if (times > 3) return null; // stop retrying, fall back
      return Math.min(times * 200, 1000);
    },
  });

  redisClient.on('connect', () => {
    usingFallback = false;
    console.log('✅ Redis connected');
  });

  redisClient.on('error', (err) => {
    console.warn('⚠️  Redis error, using in-memory fallback:', err.message);
    usingFallback = true;
  });

  return redisClient;
}

// --- Unified session store API ---

async function setSession(sessionId, sessionData) {
  const client = getRedisClient();
  const serialized = JSON.stringify(sessionData);

  if (client && !usingFallback) {
    try {
      await client.set(`interview:${sessionId}`, serialized, 'EX', SESSION_TTL);
      return;
    } catch (err) {
      console.warn('Redis set failed, using memory:', err.message);
    }
  }

  // Fallback: in-memory with manual TTL
  memoryStore.set(sessionId, {
    data: sessionData,
    expiresAt: Date.now() + SESSION_TTL * 1000,
  });
}

async function getSession(sessionId) {
  const client = getRedisClient();

  if (client && !usingFallback) {
    try {
      const raw = await client.get(`interview:${sessionId}`);
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      console.warn('Redis get failed, using memory:', err.message);
    }
  }

  // Fallback
  const entry = memoryStore.get(sessionId);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    memoryStore.delete(sessionId);
    return null;
  }
  return entry.data;
}

async function deleteSession(sessionId) {
  const client = getRedisClient();

  if (client && !usingFallback) {
    try {
      await client.del(`interview:${sessionId}`);
      return;
    } catch (err) {
      console.warn('Redis del failed:', err.message);
    }
  }

  memoryStore.delete(sessionId);
}

// Cleanup expired in-memory sessions every hour
setInterval(() => {
  const now = Date.now();
  for (const [id, entry] of memoryStore.entries()) {
    if (now > entry.expiresAt) memoryStore.delete(id);
  }
}, 60 * 60 * 1000);

module.exports = { getSession, setSession, deleteSession, getRedisClient };
