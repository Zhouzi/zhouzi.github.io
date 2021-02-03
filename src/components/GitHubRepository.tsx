import * as React from "react";
import styled from "styled-components";
import { Button } from "./Button";
import { Link } from "./Link";
import { Typography } from "./Typography";

const Container = styled.article`
  margin-bottom: 1.6rem;

  &:last-child {
    margin-bottom: 0;
  }

  @media (min-width: 40rem) {
    display: flex;
  }
`;
const Details = styled.div`
  @media (min-width: 40rem) {
    flex: 1;
    padding-right: 1rem;
  }
`;
const Actions = styled.div``;

interface GitHubRepositoryProps {
  repository: {
    description: string;
    url: string;
    name: string;
  };
}

export function GitHubRepository({ repository }: GitHubRepositoryProps) {
  return (
    <Container>
      <Details>
        <Typography variant="h3" as="h3">
          <Link href={repository.url} variant="underline">
            {repository.name}
          </Link>
        </Typography>
        <Typography color="muted">{repository.description}</Typography>
      </Details>
      <Actions>
        <Button
          as="a"
          className="github-button"
          href={repository.url}
          data-icon="octicon-star"
          data-size="large"
          data-show-count="true"
          aria-label={`Star Zhouzi/${repository.name} on GitHub`}
        >
          Star
        </Button>
      </Actions>
    </Container>
  );
}
