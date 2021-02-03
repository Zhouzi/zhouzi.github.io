require("dotenv").config();

module.exports = {
  siteMetadata: {
    title: "Gabin Aureche, Freelance Front-End Developer",
    description: [
      "Gabin Aureche is a freelance front-end developer with an expertise in React.",
      "He also has professional experience with TypeScript, GraphQL, and Node.js.",
      "He enjoys contributing to open source projects and has worked on many side projects.",
    ].join(" "),
  },
  plugins: [
    `gatsby-plugin-react-helmet`,
    `gatsby-plugin-styled-components`,
    {
      resolve: `gatsby-source-github-api`,
      options: {
        token: process.env.GITHUB_ACCESS_TOKEN,
        graphQLQuery: `
          query GetPinnedRepositories {
            user(login: "zhouzi") {
              itemShowcase {
                items(first: 6) {
                  edges {
                    node {
                      ...on Repository {
                        description
                        name
                        url
                      }
                    }
                  }
                }
              }
            }
          }
        `,
        variables: {},
      },
    },
    {
      resolve: `gatsby-source-rss-feed`,
      options: {
        url: `https://medium.com/feed/@zh0uzi`,
        name: `Medium`,
      },
    },
  ],
};
