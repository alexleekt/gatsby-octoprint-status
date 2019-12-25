import React from "react"
import { AppBar, Toolbar, Typography, Theme, makeStyles, createStyles, Container } from "@material-ui/core"

type Footer = {
  tagline: string
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
        <Container maxWidth="md">
          <Typography>{props.tagline}</Typography>
        </Container>
      </Toolbar>
    </AppBar>
  )
}

export default Footer
