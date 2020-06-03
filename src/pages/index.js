import React from "react";
import { graphql } from "gatsby";
import { Homepage } from "../components";

export default function Home(props) {
  return <Homepage {...props} />;
}

export const pageQuery = graphql`
  query QueryPosts {
    allMdx(sort: { fields: [frontmatter___date], order: DESC }) {
      edges {
        node {
          id
          frontmatter {
            path
            title
            date
          }
          excerpt
          timeToRead
        }
      }
    }
  }
`;
