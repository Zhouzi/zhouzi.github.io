import styled, { css } from "styled-components";

interface TypographyProps {
  variant?: "h1" | "h2" | "h3" | "p" | "small";
  color?: "inherit" | "muted";
}

export const Typography = styled.p<TypographyProps>`
  ${(props) => {
    switch (props.variant) {
      case "h1":
        return css`
          font-family: Poppins, sans-serif;
          font-size: 2.4rem;
          font-weight: 500;
          line-height: 1.2;
          margin: 0 0 2rem 0;

          strong {
            font-weight: 700;
          }
        `;
      case "h2":
        return css`
          font-family: Poppins, sans-serif;
          font-size: 2rem;
          font-weight: 500;
          line-height: 1.2;
          margin: 0 0 2rem 0;

          strong {
            font-weight: 700;
          }
        `;
      case "h3":
        return css`
          font-family: Poppins, sans-serif;
          font-size: 1.6rem;
          font-weight: 500;
          line-height: 1.2;
          margin: 0;

          strong {
            font-weight: 700;
          }
        `;
      case "small":
        return css`
          font-size: 0.8rem;
          margin: 0;
        `;
      case "p":
      default:
        return css`
          margin: 0 0 1.6rem 0;

          &:last-child {
            margin-bottom: 0;
          }
        `;
    }
  }}
  ${(props) => {
    switch (props.color) {
      case "muted":
        return css`
          color: ${props.theme.colors.text.light};
        `;
      case "inherit":
      default:
        return css`
          color: inherit;
        `;
    }
  }}
`;
