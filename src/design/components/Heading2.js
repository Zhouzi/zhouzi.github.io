import styled from "styled-components";
import Heading1 from "../components/Heading1";

const Heading2 = styled(Heading1).attrs({ as: "h2" })`
  font-size: 2rem;
`;

export default Heading2;
