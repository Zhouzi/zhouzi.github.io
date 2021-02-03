import styled, { css } from "styled-components";

interface LinkProps {
  variant?: "underline" | "primary";
}

export const Link = styled.a<LinkProps>`
  ${(props) => {
    switch (props.variant) {
      case "underline":
        return css`
          color: inherit;
          text-decoration: none;
          display: inline;
          background-image: linear-gradient(
            0deg,
            ${props.theme.colors.secondary.main},
            ${props.theme.colors.secondary.main} 100%
          );
          background-size: 100% 30%;
          background-repeat: no-repeat;
          background-position: 0px 90%;

          &:focus,
          &:hover {
            background-image: linear-gradient(
              0deg,
              ${props.theme.colors.secondary.dark},
              ${props.theme.colors.secondary.dark} 100%
            );
          }
        `;
      case "primary":
      default:
        return css`
          color: ${(props) => props.theme.colors.primary.main};
          text-decoration: none;
          font-weight: 500;

          &:focus,
          &:hover {
            color: ${(props) => props.theme.colors.primary.dark};
          }
        `;
    }
  }}
`;
