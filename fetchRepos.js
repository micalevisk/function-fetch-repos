const request = require('node-fetch');

// https://developer.github.com/v4/explorer
const gitHubGrapQLAPI = {
  baseURL: 'https://api.github.com',
  endpoint: 'graphql',
  queries: {
    fetchRepos: (numberOfRepos = 100, numberOfLangs = 10) => `#graphql
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
 * @param {WebtaskContext} context
 * @param {Function} doneCallback
 */
module.exports = function fetch(context, doneCallback) {
  const { GITHUB_TOKEN } = context.secrets;
  const { baseURL, endpoint, queries } = gitHubGrapQLAPI;

  return request(new URL(endpoint, baseURL), {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GITHUB_TOKEN}`
    },
    body: JSON.stringify({
      query: queries.fetchRepos(),
    })
  })
    .then(res => {
      if (res.status !== 200) throw new Error(res.statusText);
      return res.json();
    })
    .then(data => doneCallback(null, data))
    .catch(err => {
      console.error(err);
      doneCallback(err);
    })
};
