import React from "react";
import { graphql } from "gatsby";
import { MDXProvider } from "@mdx-js/react";
import { MDXRenderer } from "gatsby-plugin-mdx";
import { Link } from "gatsby";

export default function PostLayout({ data: { mdx } }) {
  return (
    <>
      <MDXProvider components={{ Link }}>
        <MDXRenderer>{mdx.body}</MDXRenderer>
      </MDXProvider>
    </>
  );
}

export const pageQuery = graphql`
  query QueryPost($id: String) {
    mdx(id: { eq: $id }) {
      body
    }
  }
`;
