import styled from "styled-components";

export const InlineList = styled.ul`
  padding: 0;
  margin: 0;
  list-style: none;
`;

export const InlineListItem = styled.li`
  display: inline-block;
  margin-right: 1.8rem;

  &:last-child {
    margin-right: 0;
  }
`;
