import * as React from "react";
import styled from "styled-components";
import dayjs from "dayjs";
import Heading3 from "./Heading3";
import Paragraph from "./Paragraph";
import Link from "./Link";

const PostLinkContainer = styled.article``;

const PostLinkTitle = styled(Heading3)`
  margin: 0.4rem 0;
`;

const PostLinkExcerpt = styled(Paragraph)`
  color: ${(props) => props.theme.colors.body.light};
`;

const PostLinkMeta = styled(Paragraph)`
  color: ${(props) => props.theme.colors.body.light};
  font-size: 0.8rem;
  margin: 0;
`;

export default function PostLink({ post }) {
  return (
    <PostLinkContainer>
      <PostLinkMeta>
        {dayjs(post.frontmatter.date).format("MMM D, YYYY")} - {post.timeToRead}{" "}
        min read
      </PostLinkMeta>
      <PostLinkTitle>
        <Link variant="underline" href={post.frontmatter.path}>
          {post.frontmatter.title}
        </Link>
      </PostLinkTitle>
      <PostLinkExcerpt>{post.excerpt}</PostLinkExcerpt>
    </PostLinkContainer>
  );
}
