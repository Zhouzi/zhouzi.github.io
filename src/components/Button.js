import styled from "styled-components";

const Button = styled.button`
  display: inline-block;
  text-decoration: none;
  cursor: pointer;
  font: inherit;
  font-weight: 500;
  color: inherit;
  border: 0;
  background: ${(props) => props.theme.colors.button.main};
  padding: 0.4rem 1rem;
  border-radius: 8px;

  &:focus,
  &:hover {
    background: ${(props) => props.theme.colors.button.hover};
  }
`;

export default Button;
