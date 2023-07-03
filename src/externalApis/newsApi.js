const axios = require('axios');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { getUserData } = require('../services/userService');
const userData = require('../data/users.json');
const { writeDataToPath } = require('../helpers/dataWriter');
const writePath = path.join(__dirname, '..', '/data/users.json');

const apiKey = process.env.NEWS_API_KEY;

async function fetchNewsSources() {
    try {
        const response = await axios.get(`${process.env.NEWS_API_BASE_URL}/v2/sources`, {
            params: {
                apiKey
            }
        });

        return response.data.sources;
    } catch (error) {
        throw new Error('Failed to fetch news sources');
    }
}

async function fetchNewsArticles(newsSources) {
    try {
        const sourceIds = newsSources.map(source => source.id);

        const requests = sourceIds.map(sourceId => {
            return axios.get(`${process.env.NEWS_API_BASE_URL}/v2/top-headlines`, {
                params: {
                    sources: sourceId,
                    apiKey
                }
            });
        });

        const responses = await Promise.all(requests);

        /** The flat() method flattens the array by one level by default, removing the nesting and 
        * creating a single array that contains all the articles from all the responses. */ 
        const articles = responses.map(response => {
            const articlesFromResponse = response.data.articles;
            // Add a unique ID to each article
            return articlesFromResponse.map(article => {
                return { id:`${article.source.name}-${article.title}`, ...article };
            });
        }).flat();

        return articles;
    } catch (error) {
        throw new Error('Failed to fetch news articles');
    }
}

async function fetchNewsArticlesByKeyword(keyword) {
    try {
        const response = await axios.get(`${process.env.NEWS_API_BASE_URL}/v2/top-headlines?q=${keyword}`, {
            params: {
                apiKey
            }
        });

        return response.data.articles;
    } catch (error) {
        throw new Error(`Failed to fetch news articles with the keyword ${keyword}`);
    }
}

const markArticleAsRead = (articleId, userId, cachedArticles) => {
  if (!cachedArticles) {
    throw new Error('Articles data not found in cache');
  }

  // Find the article with the specified ID
  const article = cachedArticles.find(article => article.id === articleId);

  if (!article) {
    throw new Error('Article not found');
  }

  const userObj = userData.users.find(user => user.id === userId);

  if (!userObj) {
    throw new Error('User not found');
  }

  if (!userObj.readArticles.includes(articleId)) {
    userObj.readArticles.push(articleId);
  } else {
    throw new Error(`Article with id ${articleId} is already marked as read`);
  }

  writeDataToPath(userData, writePath);
};

const markArticleAsFavorite = (articleId, userId, cachedArticles) => {
  if (!cachedArticles) {
    throw new Error('Articles data not found in cache');
  }

  // Find the article with the specified ID
  const article = cachedArticles.find(article => article.id === articleId);

  if (!article) {
    throw new Error('Article not found');
  }

  const userObj = userData.users.find(user => user.id === userId);

  if (!userObj) {
    throw new Error('User not found');
  }

  if (!userObj.favoriteArticles.includes(articleId)) {
    userObj.favoriteArticles.push(articleId);
  } else {
    throw new Error(`Article with id ${articleId} is already marked as favorite`);
  }

  writeDataToPath(userData, writePath);
};


const fetchReadArticlesForUser = (userId, cachedArticles) => {
  try {  
      const readArticleIds = getUserData().users.find(user => user.id === userId).readArticles;
      const readArticlesForUser = [];

      if (!cachedArticles) {
          throw new Error('Articles data not found in cache');
      }

      cachedArticles.forEach(article => {
          if (readArticleIds.includes(article.id)) {
              readArticlesForUser.push(article);
          }
      });

      return readArticlesForUser;
  } catch (error) {
      throw new Error('Failed to fetch read articles');
  }
} 

const fetchFavoriteArticlesForUser = (userId, cachedArticles) => {
  try {  
      const favoriteArticleIds = getUserData().users.find(user => user.id === userId).favoriteArticles;
      const favoriteArticlesForUser = [];

      if (!cachedArticles) {
          throw new Error('Articles data not found in cache');
      }

      cachedArticles.forEach(article => {
          if (favoriteArticleIds.includes(article.id)) {
            favoriteArticlesForUser.push(article);
          }
      });

      return favoriteArticlesForUser;
  } catch (error) {
      throw new Error('Failed to fetch favorite articles');
  }
}

const filterSourcesByUserPreferences = (articleSources, userPreferences) => {
  const { countries, sources: preferredSources, languages } = userPreferences;
  const filteredSources = articleSources.filter(articleSource => {
    // Filter by preferred sources
    if (preferredSources && preferredSources.length > 0) {
      if (!preferredSources.includes(articleSource.name)) {
        return false;
      }
    }

    // Filter by countries
    if (countries && countries.length > 0) {
      if (!countries.includes(articleSource.country)) {
        return false;
      }
    }

    // Filter by languages
    if (languages && languages.length > 0) {
      if (!languages.includes(articleSource.language)) {
        return false;
      }
    }

    return true;
  });

  return filteredSources;
}

module.exports = {
    fetchNewsSources,
    fetchNewsArticles,
    fetchNewsArticlesByKeyword,
    markArticleAsRead,
    markArticleAsFavorite,
    fetchReadArticlesForUser,
    fetchFavoriteArticlesForUser,
    filterSourcesByUserPreferences
}