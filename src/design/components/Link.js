import styled, { css } from "styled-components";

const Link = styled.a`
  font: inherit;
  background: transparent;
  border: none;
  padding: 0;
  margin: 0;

  cursor: pointer;
  display: inline;
  color: inherit;
  text-decoration: none;
  font-weight: 500;

  ${(props) => {
    switch (props.variant) {
      case "underline":
        return css`
          display: inline;
          background-image: linear-gradient(
            0deg,
            ${(props) => props.theme.colors.secondary.main},
            ${(props) => props.theme.colors.secondary.main} 100%
          );
          background-size: 100% 30%;
          background-repeat: no-repeat;
          background-position: 0 90%;

          &:focus,
          &:hover {
            background-image: linear-gradient(
              0deg,
              ${(props) => props.theme.colors.secondary.dark},
              ${(props) => props.theme.colors.secondary.dark} 100%
            );
          }
        `;
      case "color":
      default:
        return css`
          color: ${(props) => props.theme.colors.primary.main};

          &:focus,
          &:hover {
            color: ${(props) => props.theme.colors.primary.dark};
          }
        `;
    }
  }}
`;

export default Link;
