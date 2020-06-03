import React from "react";
import { Helmet } from "react-helmet";
import { IntlProvider } from "react-intl";
import { ThemeProvider, createGlobalStyle } from "styled-components";
import "modern-normalize";

const theme = {
  colors: {
    primary: {
      dark: "#cc1742",
      main: "#e83862",
    },
    secondary: {
      dark: "#f9c42b",
      main: "#ffdc78",
    },
    body: {
      main: "#0b1c3c",
      light: "#65748e",
    },
    background: {
      main: "#f9f9f9",
    },
    button: {
      main: "#e8ebf1",
      hover: "#d6dce8",
    },
  },
};

function isObject(value) {
  return Object.prototype.toString.call(value) === "[object Object]";
}

function toCSSVariables(theme, ancestors = []) {
  return Object.keys(theme).reduce(
    (acc, key) =>
      Object.assign(acc, {
        [key]: isObject(theme[key])
          ? toCSSVariables(theme[key], ancestors.concat([key]))
          : `var(--${ancestors.concat([key]).join("-")})`,
      }),
    {}
  );
}

function toCSS(theme, ancestors = []) {
  return Object.keys(theme)
    .map((key) => {
      if (isObject(theme[key])) {
        return toCSS(theme[key], ancestors.concat([key]));
      }

      return `--${ancestors.concat([key]).join("-")}: ${theme[key]};`;
    })
    .join("\n");
}

const GlobalStyle = createGlobalStyle`
  :root {
    ${toCSS(theme)}
  }
  html {
    font-size: 16px;
  }
  body {
    color: ${(props) => props.theme.colors.body.main};
    background-color: ${(props) => props.theme.colors.background.main};
    font-size: 1rem;
    line-height: 1.6;
    font-family: "Roboto Mono", monospace;
    font-weight: 400;
  }
  h1,
  h2,
  h3,
  h4,
  h5 {
    font-family: "Poppins", sans-serif;
    font-weight: 500;
    line-height: 1.2;
  }
`;

function Layout({ locale, messages, children }) {
  React.useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      return;
    }

    const githubButtons = window.document.createElement("script");
    githubButtons.async = true;
    githubButtons.defer = true;
    githubButtons.src = "https://buttons.github.io/buttons.js";

    window.document.body.appendChild(githubButtons);

    return () => {
      window.document.body.removeChild(githubButtons);
    };
  }, []);

  return (
    <IntlProvider locale={locale} messages={messages}>
      <ThemeProvider theme={toCSSVariables(theme)}>
        <Helmet
          htmlAttributes={{
            lang: locale,
          }}
          titleTemplate="%s - Gabin Aureche"
          defaultTitle="Gabin Aureche, Freelance Front-End Developer"
          link={[
            {
              rel: "stylesheet",
              href:
                "https://fonts.googleapis.com/css2?family=Poppins:wght@500;700&family=Roboto+Mono:ital,wght@0,400;0,500;1,400;1,500&display=swap",
            },
          ]}
        />
        <GlobalStyle />
        {children}
      </ThemeProvider>
    </IntlProvider>
  );
}

export default Layout;
