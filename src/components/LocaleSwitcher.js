import * as React from "react";
import { IntlProvider, useIntl, FormattedMessage } from "react-intl";
import { Link as RouterLink } from "gatsby";
import styled from "styled-components";
import { Paragraph, InlineList, InlineListItem, Link } from "../design";
import * as locales from "../messages";

const LocaleSwitcherContainer = styled.div`
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  z-index: 1;
  background-color: ${(props) => props.theme.colors.background.light};
  border-radius: 10px 10px 0 10px;
  padding: 1rem 2rem;
`;

const LocaleSwitcherParagraph = styled(Paragraph)`
  margin-bottom: 1rem;
`;

export function LocaleSwitcher() {
  const intl = useIntl();
  const [suggestedLocale, setSuggestedLocale] = React.useState(null);

  React.useEffect(() => {
    const supportedLocales = Object.keys(locales);
    const suggestedLocale = window.navigator.languages
      .map((language) =>
        supportedLocales.find((supportedLocale) =>
          language.startsWith(supportedLocale)
        )
      )
      .filter(Boolean)[0];

    if (suggestedLocale !== intl.locale) {
      setSuggestedLocale(suggestedLocale);
    }
  }, [intl.locale]);

  if (suggestedLocale == null) {
    return null;
  }

  return (
    <IntlProvider locale={suggestedLocale} messages={locales[suggestedLocale]}>
      <LocaleSwitcherContainer>
        <LocaleSwitcherParagraph>
          <FormattedMessage id="localeSwitcher.visit" />
        </LocaleSwitcherParagraph>
        <InlineList>
          <InlineListItem>
            <Link
              as={RouterLink}
              to={suggestedLocale === "en" ? "/" : `/${suggestedLocale}/`}
            >
              <FormattedMessage id="localeSwitcher.yes" />
            </Link>
          </InlineListItem>
          <InlineListItem>
            <Link
              as="button"
              type="button"
              onClick={() => setSuggestedLocale(null)}
            >
              <FormattedMessage id="localeSwitcher.no" />
            </Link>
          </InlineListItem>
        </InlineList>
      </LocaleSwitcherContainer>
    </IntlProvider>
  );
}
