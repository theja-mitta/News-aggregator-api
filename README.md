# News-aggregator-api

# News API Integration

This project integrates with the News API to fetch news sources and articles based on user preferences. It provides functionality to fetch news sources, fetch news articles, mark articles as read or favorite for a user, and retrieve read or favorite articles for a user.

## Prerequisites

Before running the project, make sure you have the following prerequisites:

- Node.js installed on your machine
- API key for the News API (obtainable from their website)

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/news-api-integration.git
   ```

2. Navigate to the project directory:

   ```bash
   cd news-api-integration
   ```

3. Install the dependencies:

   ```bash
   npm install
   ```

4. Set up environment variables:

   - Create a `.env` file in the root directory of the project.
   - Add the following environment variables to the `.env` file:

     ```plaintext
     NEWS_API_BASE_URL=<News API base URL>
     NEWS_API_KEY=<Your News API key>
     ```

     Replace `<News API base URL>` with the base URL of the News API, and `<Your News API key>` with your actual API key.

## Usage

The project provides the following functions for interacting with the News API:

- `fetchNewsSources()`: Fetches the available news sources from the News API.
- `fetchNewsArticles(newsSources)`: Fetches news articles from the News API based on the specified news sources.
- `fetchNewsArticlesByKeyword(keyword)`: Fetches news articles from the News API based on the specified keyword.
- `markArticleAsRead(articleId, userId, cachedArticles)`: Marks an article as read for a user.
- `markArticleAsFavorite(articleId, userId, cachedArticles)`: Marks an article as favorite for a user.
- `fetchReadArticlesForUser(userId, cachedArticles)`: Fetches the read articles for a user.
- `fetchFavoriteArticlesForUser(userId, cachedArticles)`: Fetches the favorite articles for a user.
- `filterSourcesByUserPreferences(articleSources, userPreferences)`: Filters article sources based on user preferences.

## API Routes
The project also includes the following API routes for users:

### User Routes

- `POST /register`: Register a new user.
- `POST /login`: Log in an existing user.
- `POST /logout`: Log out the currently logged-in user.
- `GET /preferences`: Get the news preferences for the currently logged-in user.
- `PUT /preferences`: Update the news preferences for the currently logged-in user.

Please refer to the respective code files for more details on the implementation of these routes.

### News Routes

- `GET /news/sources`: Fetch all available news sources.
- `GET /news/articles`: Fetch news articles based on specified news sources.
- `GET /news/articles/keyword/:keyword`: Fetch news articles based on a keyword.
- `POST /news/articles/:articleId/read`: Mark an article as read for the current user.
- `POST /news/articles/:articleId/favorite`: Mark an article as favorite for the current user.
- `GET /news/articles/read`: Fetch read articles for the current user.
- `GET /news/articles/favorite`: Fetch favorite articles for the current user.

Please note that the routes `/news/articles/:articleId/read` and `/news/articles/:articleId/favorite` require authentication to identify the current user.
