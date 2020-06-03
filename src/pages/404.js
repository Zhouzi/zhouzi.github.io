import * as React from "react";
import { Link as RouterLink } from "gatsby";
import {
  Layout,
  Section,
  Container,
  Heading1,
  Paragraph,
  Link,
} from "../design";

export default function PageNotFound() {
  const [searchQuery, setSearchQuery] = React.useState(null);

  React.useEffect(() => {
    // window.location.pathname is unpredictable so it must be computed at run time,
    // not in SSR
    setSearchQuery(
      window.location.pathname
        .split(/[-/]/)
        .filter((str) => str.length > 0)
        .map((str) => encodeURIComponent(str))
        .join("+")
    );
  }, []);

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
            {searchQuery && (
              <li>
                <Link href={`https://google.com/search?q=${searchQuery}`}>
                  Search for alternative links
                </Link>
              </li>
            )}
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
