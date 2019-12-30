import React from "react"
import { Helmet } from "react-helmet"
import { Container, ContainerProps } from "@material-ui/core"
import Footer from "./footer"

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  children?: any
  title: string
  tagline: string
  containerProps: ContainerProps
}
const Layout = (props: Props) => {
  return (
    <>
      <Helmet title={props.title} defer={false} />
      <Container
        {...props.containerProps}
        style={{
          marginTop: "16px",
          marginBottom: "32px",
        }}
      >
        {props.children}
      </Container>
      <Footer tagline={props.tagline} containerProps={props.containerProps} />
    </>
  )
}

export default Layout
