import React from "react";
import { graphql } from "gatsby";
import EnglishLayout from "../layouts/en";
import { Homepage, LocaleSwitcher } from "../components";

export default function EnglishHomepage(props) {
  return (
    <EnglishLayout>
      <LocaleSwitcher />
      <Homepage {...props} />
    </EnglishLayout>
  );
}

export const pageQuery = graphql`
  query EnglishHomepageQuery {
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
