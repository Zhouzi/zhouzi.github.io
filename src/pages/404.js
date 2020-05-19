import * as React from "react";
import { Link as RouterLink } from "gatsby";
import Layout from "../components/Layout";
import Section from "../components/Section";
import Container from "../components/Container";
import Heading1 from "../components/Heading1";
import Paragraph from "../components/Paragraph";
import Link from "../components/Link";

export default function PageNotFound({ location }) {
  const q = location.pathname
    .split(/[-\/]/)
    .filter((str) => str.length > 0)
    .map((str) => encodeURIComponent(str))
    .join("+");
  return (
    <Layout>
      <Section>
        <Container large>
          <Heading1>This page doesn't exist.</Heading1>
        </Container>
        <Container>
          <Paragraph>
            Maybe it's gone, or perhaps it never existed. Here are a few things
            you can try:
          </Paragraph>
          <ul>
            <li>
              <Link href={`https://google.com/search?q=${q}`}>
                Search for alternative links
              </Link>
            </li>
            <li>
              <Link as={RouterLink} to="/">
                Go to the homepage
              </Link>
            </li>
            <li>
              Report it to{" "}
              <Link href="mailto:hello@gabinaureche.com">
                hello@gabinaureche.com
              </Link>
            </li>
          </ul>
        </Container>
      </Section>
    </Layout>
  );
}
