import React, { useState } from "react"

import Layout from "../components/layout"
import { Config, OctostatusConfigForm as ConfigForm } from "../components/octostatus-config"
import OctoprintStatus from "../components/octoprint-status"

const OctostatusPage = () => {
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

  return (
    <Layout title="Octostatus" tagline="Octostatus - a lightweight octoprint status page">
      <ConfigForm onConfigChanged={onConfigChanged} />
      {state.config ? <OctoprintStatus config={state.config} /> : null}
    </Layout>
  )
}

export default OctostatusPage
