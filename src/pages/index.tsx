import React, { useState } from "react"

import Layout from "../components/layout"
import { Config, OctostatusConfigForm as ConfigForm } from "../components/octostatus-config"
import OctoprintStatus from "../components/octoprint-status"
import LinkIcon from "@material-ui/icons/Link"
import { Typography, Grid } from "@material-ui/core"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const OctostatusPage = (props: any) => {
  type State = {
    config?: Config
  }
  const [state, setState] = useState<State>({})

  const onConfigChanged = (config: Config) => {
    setState({
      ...state,
      config: config,
    })
  }

  const Permalink = () => {
    const href = (): string => {
      return `${props.location?.origin}${props.location?.pathname}?server=${state.config?.server || ""}&apiKey=${state.config?.apiKey || ""}`
    }

    return (
      <Grid container justify="flex-end">
        <Typography variant="subtitle2" align="right">
          <a href={href()}>
            Permalink <LinkIcon style={{ width: "24px", height: "24px", marginBottom: "-6px" }} />
          </a>
        </Typography>
      </Grid>
    )
  }

  return (
    <Layout title="Octostatus" tagline="Octostatus - a lightweight octoprint status page" containerProps={{ maxWidth: "sm" }}>
      <ConfigForm onConfigChanged={onConfigChanged} location={props.location} />
      <Permalink />
      <div style={{ height: "8px" }}></div>
      {state.config ? <OctoprintStatus config={state.config} /> : null}
    </Layout>
  )
}

export default OctostatusPage
