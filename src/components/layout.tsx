import { Container, ContainerProps, CssBaseline } from "@material-ui/core"
import React from "react"
import { Helmet } from "react-helmet"
import Footer from "./footer"

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  children?: any
  containerProps: ContainerProps
  readmeUrl: string
  tagline: string
  title: string
}
const Layout = (props: Props) => {
  return (
    <>
      <CssBaseline />
      <Helmet title={props.title} defer={false} />
      <Container
        {...props.containerProps}
        style={{
          marginTop: "16px",
          marginBottom: "64px",
        }}
      >
        {props.children}
      </Container>
      <Footer tagline={props.tagline} containerProps={props.containerProps} readmeUrl={props.readmeUrl} />
    </>
  )
}

export default Layout
