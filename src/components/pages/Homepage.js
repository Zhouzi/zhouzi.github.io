import React from "react";
import {
  Layout,
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
    id: "sentry-buddy",
    name: "Sentry Buddy",
    description: "Review Sentry issues one by one, the easy way.",
  },
  {
    id: "logicalornot",
    name: "Logical (Or Not)",
    description: "A Game About JavaScript Specificities.",
  },
  {
    id: "GentleForm",
    name: "GentleForm",
    description: "Accessible and user-friendly HTML5 form validation library.",
  },
  {
    id: "contrib-awakens",
    name: "Contrib Awakens",
    description: "Play games in GitHub's contribution graph.",
  },
];

export default function Home({
  data: {
    allMdx: { edges: posts },
  },
}) {
  return (
    <Layout>
      <Section>
        <Container large>
          <Heading1>
            I am <strong>Gabin Aureche</strong>, a{" "}
            <strong>freelance front-end developer</strong> based in{" "}
            <strong>France</strong>.
          </Heading1>
        </Container>
        <Container>
          <Paragraph>
            I studied computer arts and web design before testing the water as a
            freelance web designer and developer in 2013.
          </Paragraph>
          <Paragraph>
            I then joined <Link href="https://wizbii.com">Wizbii</Link> as the
            core front-end developer in 2014. My appetite for coding goal-driven
            proof of concepts led me to join their growth marketing team in
            early 2017.
          </Paragraph>
          <Paragraph>
            Later in 2017 I decided to move on to a product developer role at{" "}
            <Link href="https://gitbook.com">GitBook</Link>. A role where my
            experience in design, code and marketing overlapped.
          </Paragraph>
          <Paragraph>
            In 2019, I finally decide to offer my services as a freelance
            developer to meet and help more people.
          </Paragraph>
        </Container>
      </Section>
      <Section>
        <Container large>
          <Heading2>
            I spend a large part of my spare time building{" "}
            <strong>side projects</strong>.
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
            I also share my <strong>thoughts</strong> from time to time.
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
            I am always happy to <strong>connect</strong>.
          </Heading2>
        </Container>
        <Container>
          <Paragraph>
            Feel free to send me an email at{" "}
            <Link href="mailto:hello@gabinaureche.com">
              hello@gabinaureche.com
            </Link>
            . You can also find all my side projects on{" "}
            <Link href="https://github.com/zhouzi">GitHub</Link> and learn more
            about my career on{" "}
            <Link href="https://www.linkedin.com/in/gabinaureche/">
              LinkedIn
            </Link>
            .
          </Paragraph>
        </Container>
      </Section>
    </Layout>
  );
}
