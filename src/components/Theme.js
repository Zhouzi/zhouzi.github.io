import * as React from "react"
import { ThemeProvider } from "styled-components"

const fontFamilies = {
  heading: "Poppins, sans-serif",
  body: "Roboto Mono, monospace",
}

const fontWeights = {
  heading: {
    bold: 700,
  },
  body: {
    normal: 400,
    bold: 700,
  },
}

const lineHeights = {
  small: 1.3,
  normal: 1.6,
}

const fontSizes = {}

const textStyles = {
  heading: {
    fontFamily: fontFamilies.heading,
    lineHeight: lineHeights.small,
    fontWeight: fontWeights.heading.bold,
  },
  body: {
    fontFamily: fontFamilies.body,
    lineHeight: lineHeights.normal,
    fontWeight: fontWeights.body.normal,
  },
}

const spaces = {
  larger: "4rem",
  large: "2rem",
  normal: "1.2rem",
}

const colors = {
  background: "#190c4e",
  onBackground: "#d4cdea",
  onBackgroundEmphasis: "#fff",
  backgroundLight: "#3c2788",
  primary: "#eab533",
}

function Theme({ children }) {
  return (
    <ThemeProvider
      theme={{
        fontFamilies,
        fontWeights,
        lineHeights,
        fontSizes,
        textStyles,
        spaces,
        colors,
      }}
    >
      <>{children}</>
    </ThemeProvider>
  )
}

export default Theme
