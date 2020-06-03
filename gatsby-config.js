const path = require("path");

module.exports = {
  plugins: [
    "gatsby-plugin-react-helmet",
    "gatsby-plugin-styled-components",
    "gatsby-plugin-mdx",
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "posts",
        path: path.join(__dirname, "./content/posts"),
        ignore: ["**/.*"], // ignore files starting with a dot
      },
    },
    {
      resolve: "gatsby-plugin-canonical-urls",
      options: {
        siteUrl: "https://gabinaureche.com",
      },
    },
    {
      resolve: "gatsby-plugin-i18n",
      options: {
        langKeyDefault: "en",
        langKeyForNull: "en",
        useLangKeyLayout: true,
        prefixDefault: false,
      },
    },
  ],
};
