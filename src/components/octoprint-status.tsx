import React, { useState, useEffect } from "react"
import Moment from "react-moment"
import "./styles.css"
import Parse from "url-parse"
import { Typography, CircularProgress, Backdrop, Theme, createStyles, makeStyles, Card, CardContent, CardHeader, IconButton } from "@material-ui/core"
import Get from "../utils/octoprint-rest-api"
import { Config } from "./octostatus-config"
import RefreshIcon from "@material-ui/icons/Refresh"

type Printer = {
  // http://docs.octoprint.org/en/master/api/datamodel.html#printer-related
  state: {
    text: string
  }
  temperature: {
    tool0: {
      actual: number
      target: number
    }
    bed: {
      actual: number
      target: number
    }
  }
}

type Job = {
  // http://docs.octoprint.org/en/master/api/datamodel.html#job-related
  job: {
    file: {
      display: string
    }
  }
  progress: {
    completion: number
    printTimeLeft: number
    printTimeOrigin: number
  }
}

type Settings = {
  // http://docs.octoprint.org/en/master/api/settings.html#retrieve-current-settings
  webcam: {
    flipH: boolean
    flipV: boolean
    rotate90: boolean // Rotate webcam 90 degrees counter clockwise
    snapshotUrl: string
  }
}

type Status = {
  isUpdating: boolean
  updatedTs: number
  printer: Printer | undefined
  job: Job | undefined
  settings: Settings | undefined
}

type Props = {
  config: Config
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    backdrop: {
      zIndex: theme.zIndex.drawer + 1,
      color: "#fff",
    },
  })
)

const OctoprintStatus = (props: Props) => {
  const [state, setState] = useState<Status>({
    isUpdating: false,
    updatedTs: Date.now(),
    printer: undefined,
    job: undefined,
    settings: undefined,
  })

  const requestUpdate = async () => {
    setState({ ...state, isUpdating: true })
    const [s, p, j] = await Promise.all([
      Get(props.config.server, props.config.apiKey, "/api/settings"),
      Get(props.config.server, props.config.apiKey, "/api/printer"),
      Get(props.config.server, props.config.apiKey, "/api/job"),
    ])
    setState({
      ...state,
      settings: s,
      printer: p,
      job: j,
      updatedTs: Date.now(),
      isUpdating: false,
    })
  }

  useEffect(() => {
    requestUpdate()
  }, [props])

  const fixSnapshotUrl = (snapshotUrl: string, server: string): string => {
    try {
      const url = Parse(server)
      return `${snapshotUrl}&timestamp=${new Date().getTime()}`.replace("127.0.0.1", url.host).replace("localhost", url.host)
    } catch (error) {
      return "https://i.imgur.com/gStEz0r.png"
    }
  }

  const classes = useStyles()

  const ErrorContent = () => {
    return (
      <>
        <CardHeader
          title="Could not connect"
          action={
            <IconButton onClick={requestUpdate}>
              <RefreshIcon />
            </IconButton>
          }
        />
        <CardContent>
          <Typography>Check server and API settings.</Typography>
        </CardContent>
      </>
    )
  }

  const ApiResponseContent = () => {
    return (
      <>
        <CardHeader
          title={state.job?.job?.file?.display || `No Job Selected`}
          subheader={state.printer?.state?.text}
          action={
            <IconButton onClick={requestUpdate}>
              <RefreshIcon />
            </IconButton>
          }
        />
        <CardContent>
          <img
            style={{ width: "100%" }}
            src={fixSnapshotUrl(state.settings?.webcam?.snapshotUrl || "", props.config.server)}
            className={`rounded-corners ${state.settings?.webcam?.flipH ? "flip-horizontal" : ""} ${state.settings?.webcam?.flipV ? "flip-vertical" : ""} ${
              state.settings?.webcam?.flipH && state.settings?.webcam?.flipV ? "flip-horizontal-vertical" : ""
            }`}
          />
          {state.job?.progress.printTimeOrigin !== null ? (
            <>
              <Typography>
                {Math.round(state.job?.progress?.completion || NaN)}%
                {(state.job?.progress?.printTimeLeft || 0) > 0 ? (
                  <>
                    ETA{" "}
                    <Moment add={{ seconds: state.job?.progress?.printTimeLeft }} fromNow>
                      {Date()}
                    </Moment>
                  </>
                ) : null}
              </Typography>
            </>
          ) : null}
          <Typography>
            tool0 {state.printer?.temperature?.tool0.actual}°C
            {state.printer?.temperature?.tool0.target || 0 > 0 ? <>-&gt; {state.printer?.temperature.tool0.target}°C</> : null}
          </Typography>
          <Typography>
            bed {state.printer?.temperature?.bed.actual}°C
            {state.printer?.temperature?.bed.target || 0 > 0 ? <>-&gt; {state.printer?.temperature.bed.target}°C</> : null}
          </Typography>
        </CardContent>
      </>
    )
  }

  return (
    <>
      <Backdrop open={state.isUpdating} className={classes.backdrop}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <Card>{state.settings == undefined || state.printer == undefined || state.job == undefined ? <ErrorContent /> : <ApiResponseContent />}</Card>
    </>
  )
}

export default OctoprintStatus
