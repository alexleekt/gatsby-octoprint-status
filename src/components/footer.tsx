import React from "react"
import { AppBar, Toolbar, Typography, Theme, makeStyles, createStyles, Container, ContainerProps } from "@material-ui/core"

type Footer = {
  tagline: string
  containerProps: ContainerProps
}
const Footer = (props: Footer) => {
  const useStyles = makeStyles((theme: Theme) =>
    createStyles({
      appBar: {
        top: "auto",
        bottom: 0,
      },
    })
  )
  const classes = useStyles()
  return (
    <AppBar position="fixed" color="primary" className={classes.appBar}>
      <Toolbar>
        <Container {...props.containerProps}>
          <Typography>{props.tagline}</Typography>
        </Container>
      </Toolbar>
    </AppBar>
  )
}

export default Footer
