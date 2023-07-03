const express = require('express');
const bodyParser = require('body-parser');
const auth = require('../middleware/auth');
const newsRoutes = express.Router();
const { cache, redisClient } = require('../middleware/cacheMiddleware');
const { fetchNewsSources, fetchNewsArticles, fetchNewsArticlesByKeyword, markArticleAsRead, markArticleAsFavorite, fetchReadArticlesForUser, fetchFavoriteArticlesForUser, filterSourcesByUserPreferences } = require('../externalApis/newsApi');

newsRoutes.use(bodyParser.urlencoded({ extended: false }));
newsRoutes.use(bodyParser.json());

newsRoutes.get('/', auth, cache, async (req, res) => {
    let newsSources = await fetchNewsSources();
    await redisClient.set(req.baseUrl+'-sources', JSON.stringify(newsSources), 'EX', 3600);
    newsSources = filterSourcesByUserPreferences(newsSources, req.user.newsPreferences);
    const newsArticles = await fetchNewsArticles(newsSources);
    await redisClient.set(req.baseUrl+'-articles', JSON.stringify(newsArticles), 'EX', 3600);
    return res.status(200).send(newsArticles);
});  
  

newsRoutes.get('/search/:keyword', (req, res) => {
    try {
        const articles = fetchNewsArticlesByKeyword(req.params.keyword);
        res.status(200).send(articles);
    } catch(e) {
        res.status(500).send({message: 'Error has occured while fetching articles'});
    }    
});

newsRoutes.post('/:id/read', auth, async (req, res) => {
    const articleId = req.params.id;
    const userId = req.user.id;

    try {
        const cachedNewsArticles = await redisClient.get(req.baseUrl + '-articles');
        const parsedCachedArticles = JSON.parse(cachedNewsArticles);

        markArticleAsRead(articleId, userId, parsedCachedArticles);

        res.status(201).send({ message: `Article id ${articleId} is marked as read by user ${userId}` });
    } catch (error) {
        if (error.message.startsWith('Article with id')) {
        res.status(400).send({ message: error.message });
        } else {
        res.status(500).send({ message: 'Error has occurred while marking the article as read' });
        }
    }
});

newsRoutes.get('/read', auth, async (req, res) => {
    const userId = req.user.id;
    try {
        const cachedNewsArticles = await redisClient.get(req.baseUrl+'-articles');
        const articlesRead = fetchReadArticlesForUser(userId, JSON.parse(cachedNewsArticles));
        res.status(200).send(articlesRead);
    } catch(e) {
        res.status(500).send({message: 'Error has occured while fetching articles'});
    }    
});

newsRoutes.post('/:id/favorite', auth, async (req, res) => {
    const articleId = req.params.id;
    const userId = req.user.id;

    try {
        const cachedNewsArticles = await redisClient.get(req.baseUrl + '-articles');
        const parsedCachedArticles = JSON.parse(cachedNewsArticles);

        markArticleAsFavorite(articleId, userId, parsedCachedArticles);

        res.status(201).send({ message: `Article id ${articleId} is marked as favorite by user ${userId}` });
    } catch (error) {
        if (error.message.startsWith('Article with id')) {
        res.status(400).send({ message: error.message });
        } else {
        res.status(500).send({ message: 'Error has occurred while marking the article as favorite' });
        }
    }
});

newsRoutes.get('/favorite', auth, async (req, res) => {
    const userId = req.user.id;
    try {
        const cachedNewsArticles = await redisClient.get(req.baseUrl+'-articles');
        const favoriteArticles = fetchFavoriteArticlesForUser(userId, JSON.parse(cachedNewsArticles));
        res.status(200).send(favoriteArticles);
    } catch(e) {
        res.status(500).send({message: 'Error has occured while fetching articles'});
    }    
});


module.exports = newsRoutes;
