import * as React from "react";
import { graphql } from "gatsby";
import { Helmet } from "react-helmet";
import readingTime from "reading-time";
import excerptHTML from "excerpt-html";
import {
  BlogPost,
  Container,
  GitHubRepository,
  Layout,
  Link,
  Section,
  Typography,
} from "../components";

export const query = graphql`
  query GetHomeInfo {
    githubData {
      data {
        user {
          itemShowcase {
            items {
              edges {
                node {
                  description
                  name
                  url
                }
              }
            }
          }
        }
      }
    }
    allFeedMedium(sort: { fields: isoDate, order: DESC }, limit: 6) {
      edges {
        node {
          link
          title
          content {
            encoded
            encodedSnippet
          }
          isoDate(formatString: "MMM d, YYYY")
        }
      }
    }
  }
`;
interface GetHomeInfoQuery {
  githubData: {
    data: {
      user: {
        itemShowcase: {
          items: {
            edges: Array<{
              node: { description: string; name: string; url: string };
            }>;
          };
        };
      };
    };
  };
  allFeedMedium: {
    edges: Array<{
      node: {
        link: string;
        title: string;
        content: {
          encoded: string;
          encodedSnippet: string;
        };
        isoDate: string;
      };
    }>;
  };
}

interface HomeProps {
  data: GetHomeInfoQuery;
}

export default function Home({
  data: { githubData, allFeedMedium },
}: HomeProps) {
  return (
    <Layout>
      <Helmet>
        <script async defer src="https://buttons.github.io/buttons.js" />
      </Helmet>
      <Section>
        <Container large>
          <Typography variant="h1" as="h1">
            I am <strong>Gabin Aureche</strong>, a{" "}
            <strong>freelance front-end developer</strong> based in France.
          </Typography>
        </Container>
        <Container>
          <Typography>
            I have a degree in computer arts and web design. My appetite for
            building my own ideas from start to finish is what made me a
            developer.
          </Typography>
          <Typography>
            I joined <Link href="https://wizbii.com">Wizbii</Link> as the first
            and only front-end developer in 2014. Having to setup the front-end
            architecture for such a large audience was both challenging and
            rewarding.
          </Typography>
          <Typography>
            I then moved on to a product developer role within{" "}
            <Link href="https://gitbook.com">GitBook</Link>'s early team in
            2017. The brillant team coupled to the company's great ambitions
            made it a daily learning experience.
          </Typography>
          <Typography>
            In 2019 I decided to offer my services as a freelance front-end
            developer. I am obsessed with user experience and clean code. Let's
            get in touch if you want to build a product that makes sense while
            being robust!
          </Typography>
        </Container>
      </Section>
      <Section>
        <Container large>
          <Typography variant="h2" as="h2">
            I build <strong>side projects</strong> in my spare time.
          </Typography>
        </Container>
        <Container>
          {githubData.data.user.itemShowcase.items.edges.map(({ node }) => (
            <GitHubRepository key={node.url} repository={node} />
          ))}
        </Container>
      </Section>
      <Section>
        <Container large>
          <Typography variant="h2" as="h2">
            I also share my <strong>thoughts</strong> from time to time.
          </Typography>
        </Container>
        <Container>
          {allFeedMedium.edges.map(({ node }, index) => (
            <BlogPost
              key={index}
              post={{
                title: node.title,
                excerpt: excerptHTML(node.content.encoded),
                publishedAt: node.isoDate,
                readingTime: Math.round(
                  readingTime(node.content.encodedSnippet).minutes
                ),
                url: node.link,
              }}
            />
          ))}
        </Container>
      </Section>
      <Section>
        <Container large>
          <Typography variant="h2" as="h2">
            I am always happy to <strong>connect</strong>.
          </Typography>
        </Container>
        <Container>
          <Typography>
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
          </Typography>
        </Container>
      </Section>
    </Layout>
  );
}
