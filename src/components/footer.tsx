import React from "react"
import { AppBar, Toolbar, Typography, Theme, makeStyles, createStyles, Container, ContainerProps, Grid, Link } from "@material-ui/core"

type Footer = {
  tagline: string
  containerProps: ContainerProps
  readmeUrl: string
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
          <Grid container direction="row" justify="space-between" alignItems="center">
            <Typography>{props.tagline}</Typography>
            <Typography
              style={{
                fontVariantCaps: "all-small-caps",
              }}
            >
              <Link href={props.readmeUrl} rel="noreferrer" target="_blank" color="inherit">
                Instructions
              </Link>
            </Typography>
          </Grid>
        </Container>
      </Toolbar>
    </AppBar>
  )
}

export default Footer
