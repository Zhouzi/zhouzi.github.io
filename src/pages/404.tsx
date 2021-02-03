import * as React from "react";
import { Link as RouterLink } from "gatsby";
import { Container, Layout, Link, Section, Typography } from "../components";

export default function Page404() {
  const [searchQuery, setSearchQuery] = React.useState<null | string>(null);

  React.useEffect(() => {
    // pathname is only accessible client side, not during SSR
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
          <Typography variant="h1" as="h1">
            This page doesn't exist.
          </Typography>
        </Container>
        <Container>
          <Typography>
            Maybe it's gone, or perhaps it never existed. Here are a few things
            you can try:
          </Typography>
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
