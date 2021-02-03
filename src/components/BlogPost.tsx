import * as React from "react";
import styled from "styled-components";
import { Link } from "./Link";
import { Typography } from "./Typography";

const Container = styled.article`
  margin-bottom: 1.6rem;

  &:last-child {
    margin-bottom: 0;
  }
`;
const Title = styled(Typography)`
  margin: 0.25rem 0 0.5rem 0;
`;

interface BlogPostProps {
  post: {
    url: string;
    title: string;
    excerpt: string;
    readingTime: number;
    publishedAt: string;
  };
}

export function BlogPost({ post }: BlogPostProps) {
  return (
    <Container>
      <Typography variant="small" color="muted">
        {post.publishedAt} - {post.readingTime} min
      </Typography>
      <Title variant="h3" as="h3">
        <Link href={post.url} variant="underline">
          {post.title}
        </Link>
      </Title>
      <Typography color="muted">{post.excerpt}</Typography>
    </Container>
  );
}
