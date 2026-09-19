import { createClient } from 'redis';

// Create a Redis client. By default, it will connect to localhost:6379
const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

// Event listeners for Redis client
redisClient.on('error', (err) => console.error('Redis Client Error:', err));
redisClient.on('connect', () => console.log('✅ Connected to Redis successfully'));
redisClient.on('ready', () => console.log('🚀 Redis is ready to use'));
redisClient.on('end', () => console.log('❌ Redis disconnected'));

// Connect to the server
const connectRedis = async () => {
    try {
        await redisClient.connect();
    } catch (error) {
        console.error('Failed to connect to Redis:', error);
    }
};

connectRedis();

export default redisClient;
