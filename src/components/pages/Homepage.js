import React from "react";
import { FormattedMessage } from "react-intl";
import {
  Container,
  Section,
  Heading1,
  Heading2,
  Paragraph,
  Link,
  SideProject,
  PostLink,
} from "../../design";

const SIDE_PROJECTS = [
  {
    id: "theaterjs",
    name: "TheaterJS",
    description: "Typing animation mimicking human behavior.",
  },
  {
    id: "reactivedesign",
    name: "Reactive Design",
    description: "Collection of design insights about perceived speed.",
  },
  {
    id: "logicalornot",
    name: "Logical (Or Not)",
    description: "A Game About JavaScript Specificities.",
  },
  {
    id: "contrib-awakens",
    name: "Contrib Awakens",
    description: "Play games in GitHub's contribution graph.",
  },
  {
    id: "sentry-buddy",
    name: "Sentry Buddy",
    description: "Review Sentry issues one by one, the easy way.",
  },
  {
    id: "name-the-gwent-card",
    name: "Name The Gwent Card",
    description: "Mini game where you have to name a random Gwent card.",
  },
];

export default function Homepage({
  data: {
    allMdx: { edges: posts },
  },
}) {
  return (
    <>
      <Section>
        <Container large>
          <Heading1>
            <FormattedMessage
              id="homepage.summary"
              values={{
                b: (children) => <strong>{children}</strong>,
              }}
            />
          </Heading1>
        </Container>
        <Container>
          <Paragraph>
            <FormattedMessage id="homepage.bio.education" />
          </Paragraph>
          <Paragraph>
            <FormattedMessage
              id="homepage.bio.wizbii"
              values={{
                a: (children) => (
                  <Link href="https://wizbii.com">{children}</Link>
                ),
              }}
            />
          </Paragraph>
          <Paragraph>
            <FormattedMessage
              id="homepage.bio.gitbook"
              values={{
                a: (children) => (
                  <Link href="https://gitbook.com">{children}</Link>
                ),
              }}
            />
          </Paragraph>
          <Paragraph>
            <FormattedMessage id="homepage.bio.now" />
          </Paragraph>
        </Container>
      </Section>
      <Section>
        <Container large>
          <Heading2>
            <FormattedMessage
              id="homepage.sideProjects"
              values={{
                b: (children) => <strong>{children}</strong>,
              }}
            />
          </Heading2>
        </Container>
        <Container>
          {SIDE_PROJECTS.map((sideProject) => (
            <SideProject key={sideProject.id} sideProject={sideProject} />
          ))}
          <Paragraph>
            Find more on{" "}
            <Link href="https://github.com/zhouzi">github.com/zhouzi</Link>.
          </Paragraph>
        </Container>
      </Section>
      <Section>
        <Container large>
          <Heading2>
            <FormattedMessage
              id="homepage.thoughts"
              values={{
                b: (children) => <strong>{children}</strong>,
              }}
            />
          </Heading2>
        </Container>
        <Container>
          {posts.map(({ node: post }) => (
            <PostLink key={post.id} post={post} />
          ))}
        </Container>
      </Section>
      <Section>
        <Container large>
          <Heading2>
            <FormattedMessage
              id="homepage.connect"
              values={{
                b: (children) => <strong>{children}</strong>,
              }}
            />
          </Heading2>
        </Container>
        <Container>
          <Paragraph>
            <FormattedMessage
              id="homepage.connect.contacts"
              values={{
                email: (children) => (
                  <Link href="mailto:hello@gabinaureche.com">{children}</Link>
                ),
                github: (children) => (
                  <Link href="https://github.com/zhouzi">{children}</Link>
                ),
                linkedin: (children) => (
                  <Link href="https://www.linkedin.com/in/gabinaureche/">
                    {children}
                  </Link>
                ),
              }}
            />
          </Paragraph>
        </Container>
      </Section>
    </>
  );
}
