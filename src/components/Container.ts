import styled from "styled-components";

interface ContainerProps {
  large?: boolean;
}

export const Container = styled.div<ContainerProps>`
  max-width: ${(props) => (props.large ? "50rem" : "44rem")};
  padding: 0 1.8rem;
  margin: 0 auto;
`;
