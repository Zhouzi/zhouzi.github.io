const path = require("path");

async function createPages({ graphql, actions: { createPage }, reporter }) {
  const { errors, data } = await graphql(`
    query {
      allMdx {
        edges {
          node {
            id
            frontmatter {
              path
            }
          }
        }
      }
    }
  `);

  if (errors) {
    reporter.panicOnBuild(errors);
    return;
  }

  data.allMdx.edges.forEach(({ node }) => {
    if (node.frontmatter.path.startsWith("http")) {
      return;
    }
    createPage({
      path: node.frontmatter.path,
      component: path.resolve(path.join(__dirname, "./src/components/Post.js")),
      context: { id: node.id },
    });
  });
}

module.exports = {
  createPages,
};
