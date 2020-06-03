import React from "react";
import { graphql } from "gatsby";
import FrenchLayout from "../layouts/fr";
import { Homepage } from "../components";

export default function FrenchHomepage(props) {
  return (
    <FrenchLayout>
      <Homepage {...props} />
    </FrenchLayout>
  );
}

export const pageQuery = graphql`
  query FrenchHomepageQuery {
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
