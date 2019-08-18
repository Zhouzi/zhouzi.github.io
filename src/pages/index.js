import * as React from "react"
import styled, { keyframes } from "styled-components"
import { Layout, SEO } from "../components"

const ANIMATION_DELAY = 300

const Container = styled.div`
  max-width: 42rem;
  margin: 0 auto;
  padding: ${props => props.theme.spaces.larger}
    ${props => props.theme.spaces.normal};
`
const Hero = styled.div`
  display: flex;
  align-items: center;
  min-height: 100vh;
`
const slideUp = keyframes`
  from {
    transform: translateY(0.4rem);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`
const SlideUp = styled.div`
  animation: ${slideUp} 2000ms forwards;
  animation-delay: ${props => props.order * ANIMATION_DELAY}ms;
  opacity: 0;
`
const Heading = styled(SlideUp)`
  ${props => props.theme.textStyles.heading};
  color: ${props => props.theme.colors.onBackgroundEmphasis};
  margin: 0 0 ${props => props.theme.spaces.large} 0;
`
Heading.defaultProps = {
  as: "h1",
  order: 0,
}
const slidingUnderline = keyframes`
  from {
    background-position: 0 0;
  }
  to {
    background-position: 0 100%;
  }
`
const SKEW = 6
const HeadingStrong = styled.strong`
  display: inline-block;
  color: ${props => props.theme.colors.primary};
  background: linear-gradient(
    0deg,
    rgba(0, 0, 0, 0) 6%,
    ${props => props.theme.colors.backgroundLight} 6%,
    ${props => props.theme.colors.backgroundLight} 24%,
    rgba(0, 0, 0, 0) 24%
  );
  background-size: 100% 200%;
  animation: ${slidingUnderline} 1000ms forwards;
  animation-delay: ${props => props.order * ANIMATION_DELAY}ms;
  transform: skew(-${SKEW}deg);
`
const HeadingStrongInner = styled.span`
  display: inline-block;
  transform: skew(${SKEW}deg);
`
Heading.Strong = ({ children, ...props }) => (
  <HeadingStrong {...props}>
    <HeadingStrongInner>{children}</HeadingStrongInner>
  </HeadingStrong>
)

const Paragraph = styled(SlideUp)`
  margin: 0 0 ${props => props.theme.spaces.normal} 0;
`
Paragraph.defaultProps = {
  as: "p",
  order: 0,
}
const Link = styled.a`
  color: ${props => props.theme.colors.primary};
  text-decoration: none;
  font-weight: ${props => props.theme.fontWeights.body.bold};

  &::before,
  &::after {
    color: ${props => props.theme.colors.backgroundLight};
  }

  &::before {
    content: "{";
  }
  &::after {
    content: "}";
  }

  &:focus,
  &:hover {
    color: ${props => props.theme.colors.onBackgroundEmphasis};

    &::before,
    &::after {
      color: ${props => props.theme.colors.primary};
    }
  }
`

const IndexPage = () => {
  return (
    <Layout>
      <SEO />
      <Hero>
        <Container>
          <Heading order={0}>
            I am <Heading.Strong order={4}>Gabin Aureche</Heading.Strong>, a
            freelance{" "}
            <Heading.Strong order={5}>front-end developer</Heading.Strong> based
            in France.
          </Heading>
          <Paragraph order={1}>
            I help teams architecture their web application's front-end for a
            better user and developer experience.
          </Paragraph>
          <Paragraph order={2}>
            Previously, I worked full-time at{" "}
            <Link href="https://wizbii.com/">Wizbii</Link>, and then{" "}
            <Link href="https://gitbook.com/">GitBook</Link>. Learn more about
            my career on{" "}
            <Link href="https://linkedin.com/in/gabinaureche">LinkedIn</Link>,
            browse my contributions on{" "}
            <Link href="https://github.com/zhouzi">GitHub</Link>, and read my
            thoughts on <Link href="https://medium.com/@zh0uzi">Medium</Link>.
          </Paragraph>
          <Paragraph order={3}>
            Have a question? Send me an email:{" "}
            <Link href="mailto:hello@gabinaureche.com">
              hello@gabinaureche.com
            </Link>
            .
          </Paragraph>
        </Container>
      </Hero>
    </Layout>
  )
}

export default IndexPage
