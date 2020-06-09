import React from "react";
import { graphql } from "gatsby";
import FrenchLayout from "../layouts/fr";
import { Homepage, LocaleSwitcher } from "../components";

export default function FrenchHomepage(props) {
  return (
    <FrenchLayout>
      <LocaleSwitcher />
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
