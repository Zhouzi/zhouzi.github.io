import * as React from "react"
import Theme from "./Theme"
import GlobalStyle from "./GlobalStyle"

function Layout({ children }) {
  return (
    <Theme>
      <GlobalStyle />
      {children}
    </Theme>
  )
}

export default Layout
