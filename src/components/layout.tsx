import React from "react"
import { Helmet } from "react-helmet"
import { Container } from "@material-ui/core"
import Footer from "./footer"

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  children?: any
  title: string
  tagline: string
}
const Layout = (props: Props) => {
  return (
    <>
      <Helmet title={props.title} defer={false} />
      <Container
        maxWidth="md"
        style={{
          marginTop: "16px",
          marginBottom: "16px",
        }}
      >
        {props.children}
      </Container>
      <Footer tagline={props.tagline} />
    </>
  )
}

export default Layout
