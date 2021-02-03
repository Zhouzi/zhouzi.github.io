import * as React from "react";
import { graphql, useStaticQuery } from "gatsby";
import { Helmet } from "react-helmet";
import { createGlobalStyle, ThemeProvider } from "styled-components";
import "modern-normalize/modern-normalize.css";
import { theme } from "../theme";

const GetLayoutInfo = graphql`
  query GetLayoutInfo {
    site {
      siteMetadata {
        title
        description
      }
    }
  }
`;
interface GetLayoutInfoQuery {
  site: {
    siteMetadata: {
      title: string;
      description: string;
    };
  };
}

const GlobalStyle = createGlobalStyle`
  body {
    font-size: 1rem;
    line-height: 1.6;
    font-family: "Roboto Mono", monospace;
    font-weight: 400;
    color: ${(props) => props.theme.colors.text.main};
    background-color: ${(props) => props.theme.colors.background.main}
  }
`;

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { site } = useStaticQuery<GetLayoutInfoQuery>(GetLayoutInfo);
  return (
    <ThemeProvider theme={theme}>
      <Helmet title={site.siteMetadata.title}>
        <meta name="description" content={site.siteMetadata.description} />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@500;700&family=Roboto+Mono:ital,wght@0,400;0,500;1,400;1,500&display=swap"
        />
      </Helmet>
      <GlobalStyle />
      {children}
    </ThemeProvider>
  );
}
