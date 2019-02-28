// inspirado em https://github.com/stursby/hasvuepassedreactyet/blob/master/functions/fetchGithubStars.js
const axios = require('axios');

// https://developer.github.com/v4/explorer
const gitHubGrapQLAPI = {
  baseURL: 'https://api.github.com',
  endpoint: 'graphql',
  queries: {
    getRepositories: (numberOfRepos = 100, numberOfLangs = 10) => `
      query {
        viewer {
          bio
          repositories(first: ${numberOfRepos}, orderBy: { field: CREATED_AT,  direction: DESC }) {
            edges {
              node {
                ...repoInfo
                languages(first: ${numberOfLangs}) {
                  edges {
                    node {
                      name
                      color
                    }
                  }
                }
              }
            }
          }
        }
      }

      fragment repoInfo on Repository {
        name
        url
        description
        homepageUrl
        createdAt
        updatedAt
        isFork
        isPrivate
        owner {
          login
        }
      }
    `
  }
};


/**
 * @param context {WebtaskContext}
 */
module.exports = function(context, cb) {
  const { GITHUB_TOKEN } = context.secrets;
  const { baseURL, endpoint, queries } = gitHubGrapQLAPI;

  // Github GraphQL axios instance
  const github = axios.create({
    baseURL,
    headers: {
      'Authorization': `Bearer ${GITHUB_TOKEN}`
    }
  });

  github.post(endpoint, { query: queries.getRepositories() })
        .catch(err => {
          console.error(err);
          return cb(err);
        })
        .then(res => cb(null, res.data));
};
