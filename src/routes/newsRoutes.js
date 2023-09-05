const express = require('express');
const bodyParser = require('body-parser');
const auth = require('../middleware/auth');
const newsRoutes = express.Router();
const { cache, redisClient } = require('../middleware/cacheMiddleware');
const {
    fetchNewsSources,
    fetchNewsArticles,
    fetchNewsArticlesByKeyword,
    markArticleAsRead,
    markArticleAsFavorite,
    fetchReadArticlesForUser,
    fetchFavoriteArticlesForUser,
    filterSourcesByUserPreferences,
  } = require('../externalApis/newsApi');

newsRoutes.use(bodyParser.urlencoded({ extended: false }));
newsRoutes.use(bodyParser.json());

const cacheExpirationTime = parseInt(process.env.CACHE_EXPIRATION_TIME);

// Fetch news articles based on user preferences
// GET /news
newsRoutes.get('/', auth, cache, async (req, res) => {
  try {
        const newsSources = await fetchNewsSources(); // Fetch news sources
        await redisClient.set(`${req.baseUrl}-sources`, JSON.stringify(newsSources), 'EX', cacheExpirationTime); // Cache news sources
        const filteredSources = filterSourcesByUserPreferences(newsSources, req.user.newsPreferences); // Filter sources based on user preferences
        const newsArticles = await fetchNewsArticles(filteredSources); // Fetch news articles from filtered sources
        await redisClient.set(`${req.baseUrl}-articles`, JSON.stringify(newsArticles), 'EX', cacheExpirationTime); // Cache news articles
        return res.status(200).send(newsArticles); // Send the fetched news articles
  } catch (error) {
        console.error('Error occurred while fetching news articles:', error);
        res.status(500).send({ message: 'Error occurred while fetching news articles' });
  }
});
  

// Search news articles by keyword
// GET /news/search/:keyword
newsRoutes.get('/search/:keyword', async (req, res) => {
    try {
        const articles = await fetchNewsArticlesByKeyword(req.params.keyword); // Fetch news articles by keyword
        res.status(200).send(articles); // Send the fetched articles
    } catch (error) {
        console.error('Error occurred while fetching articles by keyword:', error);
        res.status(500).send({ message: 'Error occurred while fetching articles by keyword' });
    }
});

// Mark an article as read
// POST /news/:id/read
newsRoutes.post('/:id/read', auth, async (req, res) => {
    const articleId = req.params.id;
    const userId = req.user.id;

    try {
        const cachedNewsArticles = await redisClient.get(`${req.baseUrl}-articles`); // Get cached news articles
        const parsedCachedArticles = JSON.parse(cachedNewsArticles);

        markArticleAsRead(articleId, userId, parsedCachedArticles); // Mark the article as read

        res.status(201).send({ message: `Article id ${articleId} is marked as read by user ${userId}` });
    } catch (error) {
        if (error.message.startsWith('Article with id')) {
            res.status(400).send({ message: error.message });
        } else {
            console.error('Error occurred while marking the article as read:', error);
            res.status(500).send({ message: 'Error occurred while marking the article as read' });
        }
    }
});

// Get read articles for a user
// GET /news/read
newsRoutes.get('/read', auth, async (req, res) => {
    const userId = req.user.id;

    try {
        const cachedNewsArticles = await redisClient.get(`${req.baseUrl}-articles`); // Get cached news articles
        const articlesRead = fetchReadArticlesForUser(userId, JSON.parse(cachedNewsArticles)); // Fetch read articles for the user
        res.status(200).send(articlesRead); // Send the fetched read articles
    } catch (error) {
        console.error('Error occurred while fetching read articles:', error);
        res.status(500).send({ message: 'Error occurred while fetching read articles' });
    }
});

// Mark an article as favorite
// POST /news/:id/favorite
newsRoutes.post('/:id/favorite', auth, async (req, res) => {
    const articleId = req.params.id;
    const userId = req.user.id;

    try {
        const cachedNewsArticles = await redisClient.get(`${req.baseUrl}-articles`); // Get cached news articles
        const parsedCachedArticles = JSON.parse(cachedNewsArticles);

        markArticleAsFavorite(articleId, userId, parsedCachedArticles); // Mark the article as favorite

        res.status(201).send({ message: `Article id ${articleId} is marked as favorite by user ${userId}` });
    } catch (error) {
        if (error.message.startsWith('Article with id')) {
            res.status(400).send({ message: error.message });
        } else {
            res.status(500).send({ message: 'Error occurred while marking the article as favorite' });
        }
    }
});

// Get favorite articles for a user
// GET /news/favorite
newsRoutes.get('/favorite', auth, async (req, res) => {
    const userId = req.user.id;

    try {
        const cachedNewsArticles = await redisClient.get(`${req.baseUrl}-articles`); // Get cached news articles
        const favoriteArticles = fetchFavoriteArticlesForUser(userId, JSON.parse(cachedNewsArticles)); // Fetch favorite articles for the user
        res.status(200).send(favoriteArticles); // Send the fetched favorite articles
    } catch (error) {
        res.status(500).send({ message: 'Error occurred while fetching favorite articles' });
    }
});


module.exports = newsRoutes;
