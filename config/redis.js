require('dotenv').config()
const { createClient } = require('redis')
const RedisStore = require('connect-redis').default;

const redisClient = createClient({
    password: process.env.REDIS_PASS,
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    }
});

redisClient.connect()
    .catch((error) => {
        console.error('Redis client connection error:', error);
    })

const redisStore = new RedisStore({
    client: redisClient
});

module.exports = redisStore;