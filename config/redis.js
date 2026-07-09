const Redis = require('ioredis');

const REDIS_HOST = process.env.REDIS_HOST;
const REDIS_PORT = Number(process.env.REDIS_PORT || 6379);
const REDIS_CONNECT_TIMEOUT_MS = Number(process.env.REDIS_CONNECT_TIMEOUT_MS || 15000); // زيادة للـ TLS handshake
const REDIS_COMMAND_TIMEOUT_MS = Number(process.env.REDIS_COMMAND_TIMEOUT_MS || 3000);

if (!REDIS_HOST) {
    throw new Error('REDIS_HOST must be set to the AWS ElastiCache primary endpoint DNS');
}

const createCommandTimeout = (ms, message) => new Promise((_, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), ms);
    timer.unref();
});

const redisClient = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
    family: 4,
    connectTimeout: REDIS_CONNECT_TIMEOUT_MS,
    maxRetriesPerRequest: 1,
    enableOfflineQueue: true,
    enableAutoPipelining: false,
    keepAlive: 10000,
    tls: {
        servername: REDIS_HOST,
        rejectUnauthorized: false,
    },
    retryStrategy(times) {
        return Math.min(times * 100, 2000);
    },
    reconnectOnError(err) {
        if (!err || !err.message) return false;
        return /READONLY|ECONNRESET|EPIPE|ETIMEDOUT|ECONNREFUSED/.test(err.message);
    }
});

// تم السماح للـ connecting status عشان ما يضربش Error والـ TLS لسه بيقوم
const isRedisReady = () => redisClient.status === 'ready' || redisClient.status === 'connecting';

const runRedisCommandWithTimeout = async(commandFn, timeoutMs = REDIS_COMMAND_TIMEOUT_MS) => {
    if (redisClient.status === 'connecting') {
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    if (!isRedisReady()) {
        return Promise.reject(new Error(`Redis client is not ready: ${redisClient.status}`));
    }

    return Promise.race([
        commandFn(),
        createCommandTimeout(timeoutMs, `Redis command timed out after ${timeoutMs}ms`)
    ]);
};

redisClient.on('connect', () => console.log('✅ Connected to Redis (TLS)'));
redisClient.on('ready', () => console.log('⚡ Redis client ready for commands'));
redisClient.on('error', (err) => console.error('❌ Redis Client Error:', err.message));

redisClient.safeGet = async(key, timeoutMs = REDIS_COMMAND_TIMEOUT_MS) => {
    return runRedisCommandWithTimeout(() => redisClient.get(key), timeoutMs);
};

redisClient.safeSetEx = async(key, ttlSeconds, value, timeoutMs = REDIS_COMMAND_TIMEOUT_MS) => {
    return runRedisCommandWithTimeout(() => redisClient.set(key, value, 'EX', ttlSeconds), timeoutMs);
};

redisClient.safeDelPattern = async(pattern, timeoutMs = REDIS_COMMAND_TIMEOUT_MS) => {
    return runRedisCommandWithTimeout(async() => {
        const keys = await redisClient.keys(pattern);
        if (!keys.length) {
            return 0;
        }
        return redisClient.del(keys);
    }, timeoutMs);
};

redisClient.safeLpush = async(key, value, timeoutMs = REDIS_COMMAND_TIMEOUT_MS) => {
    return runRedisCommandWithTimeout(() => redisClient.lpush(key, value), timeoutMs);
};

redisClient.safeRpop = async(key, timeoutMs = REDIS_COMMAND_TIMEOUT_MS) => {
    return runRedisCommandWithTimeout(() => redisClient.rpop(key), timeoutMs);
};

module.exports = redisClient;