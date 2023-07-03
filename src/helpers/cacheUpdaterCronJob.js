const cron = require('node-cron');
const fs = require('fs');
const { fetchNewsSources, filterSourcesByUserPreferences, fetchNewsArticles } = require('../externalApis/newsApi');
const { redisClient } = require('../middleware/cacheMiddleware'); // Import your cache instance

// Set the file path for the log file
const logFilePath = __dirname + '/cronjob.log';

// Create a writable stream to the log file
const logStream = fs.createWriteStream(logFilePath, { flags: 'a' });

// Redirect console output to the log file
console.log = (message) => logStream.write(`${message}\n`);

// Schedule the cron job with log redirection
const job = cron.schedule('0 */8 * * *', async () => {
  try {
    const cacheKey = '/news'; // Use the request base URL as the cache key

    // Fetch the latest news article sources
    let newsSources = await fetchNewsSources();
    // Update the cached news article sources
    await redisClient.set(cacheKey+'-sources', JSON.stringify(newsSources), 'EX', 3600);
    newsSources = filterSourcesByUserPreferences(newsSources, req.user.newsPreferences);

    const newsArticles = await fetchNewsArticles(newsSources);
    await redisClient.set(cacheKey+'-articles', JSON.stringify(newsArticles), 'EX', 3600);
    // Log the update
    console.log('Cached news articles updated.');
  } catch (error) {
    console.error('Failed to update cached news article sources:', error);
  }
}, {
  scheduled: true,
  timezone: 'Asia/Kolkata', // Replace 'your_timezone' with the appropriate timezone
});

// Start the cron job
job.start();

// Export the cron job instance for external use
module.exports = job;
