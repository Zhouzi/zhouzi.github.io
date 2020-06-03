import styled from "styled-components";

const Container = styled.div`
  max-width: ${(props) => (props.large ? "50rem" : "44rem")};
  margin: 0 auto;
  padding: 0 1.8rem;
`;

export default Container;
