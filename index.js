#!/usr/bin/env node
const configed = require('dotenv').config();

// file system
const fs = require('fs');

// Use the unofficial Node.js client library to integrate News API into your Node.js application
// without worrying about what's going on under the hood.
// https://newsapi.org/docs/client-libraries/node-js
const NewsAPI = require('newsapi');

const MAX_PAGE_SIZE = 100;
const apiKey = process.env.NEWS_API_KEY;

if(apiKey === undefined) {
  console.error('no News API key defined in environment variable NEWS_API_KEY');
  process.exit(1);
}

// expects the NEWS_API_KEY environment variable to be set to the value of your API key.
const newsapi = new NewsAPI(apiKey);

function clean(obj) {
  for (var propName in obj) {
    if (obj[propName] === null || obj[propName] === undefined) {
      delete obj[propName];
    }
  }
}

class News {
  everything(params) {
    return this._paginatedEndpoint('everything', params);
  }

  topHeadlines(params) {
    return this._paginatedEndpoint('topHeadlines', params);
  }

  sources(params) {
   return newsapi.v2.sources(params);
  }

  _paginatedEndpoint(name, params) {
    // remove undefined values so they are not coerced to strings
    clean(params);

    // assume first page if no page param supplied
    const { page = 1 } = params;

    // make a single request if we know there's only one page
    if (page === 1) {
      return newsapi.v2[name](params);
    } else if (page > 1) {
      let promises = [];

      for(let i = 0; i < pages; i++) {
        apiParams = Object.assign({ page: (i + 1), pageSize }, params);

        delete params. pages;

        const req = newsapi.v2[name](apiParams);
        promises.push(req);
      }

      return Promise.all(promises);
    }
  }

  _paginatedResponse(result, verbose, write) {
    let merged = result;

    if(Array.isArray(result)) {
      merged = {
        status: 'ok',
        totalResults: result[0].totalResults,
        articles: []
      };

      result.reduce((acc, { articles }) => {
        acc.articles = acc.articles.concat(articles);
        return acc;
      }, merged);
    }

    return merged;
  }
}

// configuration
const { version } = require('./package.json');
program.version(version);

const news = new News(program);
program.parse(process.argv);

// export an instantiated singleton
module.exports = news;