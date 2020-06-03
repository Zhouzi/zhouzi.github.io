import * as React from "react";
import styled from "styled-components";
import Heading3 from "./Heading3";
import Paragraph from "./Paragraph";
import Link from "./Link";
import Button from "./Button";

const SideProjectContainer = styled.article`
  @media (min-width: 40rem) {
    display: flex;
    align-items: baseline;
  }
  margin-bottom: 1.8rem;
`;

const SideProjectDetails = styled.div`
  flex: 1;
`;

const SideProjectActions = styled.div``;

const SideProjectName = styled(Heading3)``;

const SideProjectDescription = styled(Paragraph)`
  color: ${(props) => props.theme.colors.body.light};
  margin: 0 0 0.4rem 0;
`;

const SideProjectStarButton = styled(Button).attrs({
  as: "a",
  className: "github-button",
  "data-icon": "octicon-star",
  "data-size": "large",
  "data-show-count": "true",
})``;

function SideProject({ sideProject }) {
  return (
    <SideProjectContainer>
      <SideProjectDetails>
        <SideProjectName>
          <Link
            variant="underline"
            href={`https://github.com/zhouzi/${sideProject.id}`}
          >
            {sideProject.name}
          </Link>
        </SideProjectName>
        <SideProjectDescription>
          {sideProject.description}
        </SideProjectDescription>
      </SideProjectDetails>
      <SideProjectActions>
        <SideProjectStarButton
          href={`https://github.com/zhouzi/${sideProject.id}`}
          aria-label={`Star zhouzi/${sideProject.id} on GitHub`}
        >
          Star
        </SideProjectStarButton>
      </SideProjectActions>
    </SideProjectContainer>
  );
}

export default SideProject;
