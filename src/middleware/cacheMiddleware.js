const Redis = require('ioredis');

// Create a Redis client
const redisClient = new Redis({
  host: 'localhost', // Redis server host
  port: 6379 // Redis server port
});

/**
 * Caching middleware
 * Checks if the data is cached and returns it if available,
 * otherwise proceeds to the next middleware or route handler.
 */
const cache = async (req, res, next) => {
  const cacheKey = req.baseUrl; // Use the request base URL as the cache key

  // Check if news sources are cached
  const cachedNewsSources = await redisClient.get(cacheKey + '-sources');
  if (cachedNewsSources) {
    // Check if news articles are cached
    const cachedNewsArticles = await redisClient.get(cacheKey + '-articles');
    if (cachedNewsArticles) {
      return res.status(200).send(JSON.parse(cachedNewsArticles));
    }
  }

  // If data is not cached, proceed to the next middleware or route handler
  next();
};

module.exports = {
  cache,
  redisClient
};
