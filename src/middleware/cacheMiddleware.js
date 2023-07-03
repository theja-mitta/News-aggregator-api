const Redis = require('ioredis');

const redisClient = new Redis({
  host: 'localhost', // Redis server host
  port: 6379 // Redis server port
});


// Caching middleware
const cache = async (req, res, next) => {
  const cacheKey = req.baseUrl; // Use the request base URL as the cache key
  // Check if data is cached
  const cachedNewsSources = await redisClient.get(cacheKey+'-sources');
  if (cachedNewsSources) {
    const cachedNewsArticles = await redisClient.get(cacheKey+'-articles');
    if (cachedNewsArticles) {
      return res.status(200).send(JSON.parse(cachedNewsArticles));
    }
  }
  // If data is not cached, proceed to the next middleware or route handler
  next();
}


module.exports = {
  cache,
  redisClient
};
