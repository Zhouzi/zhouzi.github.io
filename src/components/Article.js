import * as React from "react";
import styled from "styled-components";
import Heading3 from "./Heading3";
import Paragraph from "./Paragraph";
import Link from "./Link";

const ArticleContainer = styled.article``;

const ArticleTitle = styled(Heading3)`
  margin: 0.4rem 0;
`;

const ArticleExcerpt = styled(Paragraph)`
  color: ${(props) => props.theme.colors.body.light};
`;

const ArticleMeta = styled(Paragraph)`
  color: ${(props) => props.theme.colors.body.light};
  font-size: 0.8rem;
  margin: 0;
`;

function Article({ article }) {
  return (
    <ArticleContainer>
      <ArticleMeta>
        {article.publishedDate} - {article.length}
      </ArticleMeta>
      <ArticleTitle>
        <Link variant="underline" href={article.url}>
          {article.title}
        </Link>
      </ArticleTitle>
      <ArticleExcerpt>{article.excerpt}</ArticleExcerpt>
    </ArticleContainer>
  );
}

export default Article;
