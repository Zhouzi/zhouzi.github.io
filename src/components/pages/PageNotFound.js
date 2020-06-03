import * as React from "react";
import { Link as RouterLink } from "gatsby";
import { FormattedMessage } from "react-intl";
import { Section, Container, Heading1, Paragraph, Link } from "../../design";

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
    <Section>
      <Container large>
        <Heading1>
          <FormattedMessage id="404.heading" />
        </Heading1>
      </Container>
      <Container>
        <Paragraph>
          <FormattedMessage id="404.tips" />
        </Paragraph>
        <ul>
          {searchQuery && (
            <li>
              <Link href={`https://google.com/search?q=${searchQuery}`}>
                <FormattedMessage id="404.alternatives" />
              </Link>
            </li>
          )}
          <li>
            <Link as={RouterLink} to="/">
              <FormattedMessage id="404.homepage" />
            </Link>
          </li>
          <li>
            <FormattedMessage
              id="404.report"
              values={{
                a: (children) => (
                  <Link href="mailto:hello@gabinaureche.com">{children}</Link>
                ),
              }}
            />
          </li>
        </ul>
      </Container>
    </Section>
  );
}
