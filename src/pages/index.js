import React from "react";
import Layout from "../components/Layout";
import Container from "../components/Container";
import Section from "../components/Section";
import Heading1 from "../components/Heading1";
import Heading2 from "../components/Heading2";
import Paragraph from "../components/Paragraph";
import Link from "../components/Link";
import SideProject from "../components/SideProject";
import Article from "../components/Article";

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

const ARTICLES = [
  {
    url:
      "https://medium.com/@Zh0uzi/setting-up-a-javascript-project-prerequisites-a0bec81b12df?source=your_stories_page---------------------------",
    title: "Setting up a JavaScript project: Prerequisites",
    excerpt:
      "Obviously, you need some JavaScript, HTML and CSS knowledge to start a JavaScript project. You also need to install Node on your computer…",
    publishedDate: "Feb 5, 2019",
    length: "6 min read",
  },
  {
    url:
      "https://medium.com/@Zh0uzi/my-concerns-with-react-hooks-6afda0acc672?source=your_stories_page---------------------------",
    title: "My concerns with React hooks",
    excerpt:
      "Until recently, React had two types of components: functional or class.",
    publishedDate: "Nov 27, 2018",
    length: "5 min read",
  },
  {
    url:
      "https://medium.com/@Zh0uzi/3-criteria-to-prioritize-bugs-53698bcda124?source=your_stories_page---------------------------",
    title: "3 criteria to prioritize bugs",
    excerpt:
      "Because it’s impossible to anticipate every possible situation, bugs are unavoidable. No one likes bugs and we all want them to be fixed…",
    publishedDate: "Nov 7, 2018",
    length: "2 min read",
  },
  {
    url:
      "https://medium.com/@Zh0uzi/the-art-of-listening-to-juniors-b16306c53287?source=your_stories_page---------------------------",
    title: "The art of listening to juniors",
    excerpt:
      "I am lucky that I regularly have the chance to mentor juniors through their career debut. I truly enjoy helping people develop their…",
    publishedDate: "Oct 18, 2018",
    length: "3 min read",
  },
  {
    url:
      "https://medium.com/@Zh0uzi/setting-up-a-javascript-project-introduction-c8eca809b133?source=your_stories_page---------------------------",
    title: "Setting up a JavaScript project: Introduction",
    excerpt:
      "The JavaScript language has been evolving at an exponentially fast pace for a few years. With new tools and features came an increasing…",
    publishedDate: "Sep 27, 2018",
    length: "3 min read",
  },
  {
    url:
      "https://medium.com/@Zh0uzi/on-banning-racial-terms-in-programming-bdc5b6255d9f?source=your_stories_page---------------------------",
    title: "On banning racial terms in programming",
    excerpt:
      "There’s a trend lately with people banning words for their racial connotation in programming. A few examples are master/slave, blacklist…",
    publishedDate: "Sep 18, 2018",
    length: "3 min read",
  },
  {
    url:
      "https://wizbii.tech/maman-papa-je-suis-d%C3%A9veloppeur-front-end-et-voil%C3%A0-ce-que-%C3%A7a-veut-dire-fb7d98c5e0b8?source=your_stories_page---------------------------",
    title:
      "Maman, Papa, je suis développeur front-end et voilà ce que ça veut dire",
    excerpt: "Mes parents n’ont aucune idée de ce que je fais.",
    publishedDate: "Sep 14, 2016",
    length: "7 min read",
  },
];

function Home() {
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
            I then join <Link href="https://wizbii.com">Wizbii</Link> as the
            core front-end developer in 2014. My appetite for coding goal-driven
            proof of concepts led me to join their growth marketing team in
            early 2017.
          </Paragraph>
          <Paragraph>
            Later in 2017 I decided to move on to a product developer role at{" "}
            <Link href="https://gitbook.com">GitBook</Link>. I worked on
            features from A to Z, with a top-notch serverless architecture and a
            brillant team.
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
          {ARTICLES.map((article) => (
            <Article key={article.url} article={article} />
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

export default Home;
