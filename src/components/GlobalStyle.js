import { createGlobalStyle, css } from "styled-components"

const GlobalStyle = createGlobalStyle`
    html {
        font-size: 16px;
    }

    @media (min-width: 800px) {
        html {
            font-size: 18px;
        }
    }

    @media (min-width: 1200px) {
        html {
            font-size: 20px;
        }
    }

    body {
        ${props => css(props.theme.textStyles.body)};
        padding-bottom: ${props => props.theme.spaces.largest};
        color: ${props => props.theme.colors.onBackground};
        background-color: ${props => props.theme.colors.background};
    }
`

export default GlobalStyle
