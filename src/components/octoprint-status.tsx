import React, { useState, useEffect } from "react"
import Moment from "react-moment"
import "./styles.css"
import Parse from "url-parse"
import { Typography, Card, CardContent, CardHeader, IconButton, CardActions, CircularProgress } from "@material-ui/core"
import Get from "../utils/octoprint-rest-api"
import { Config } from "./octostatus-config"
import RefreshIcon from "@material-ui/icons/Refresh"
import Timer from "react-compound-timer"
import Img, { ImgProps } from "react-image"
import posed from "react-pose"

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
  printer: Printer | undefined
  job: Job | undefined
  settings: Settings | undefined
}

type Props = {
  config: Config
}

const OctoprintStatus = (props: Props) => {
  const [status, setStatus] = useState<Status>({
    printer: undefined,
    job: undefined,
    settings: undefined,
  })

  const requestUpdate = async () => {
    const [s, p, j] = await Promise.all([
      Get(props.config.server, props.config.apiKey, "/api/settings"),
      Get(props.config.server, props.config.apiKey, "/api/printer"),
      Get(props.config.server, props.config.apiKey, "/api/job"),
    ])
    setStatus({
      ...status,
      settings: s,
      printer: p,
      job: j,
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

  const DisplayBox = posed.div({
    visible: { display: "block" },
    hidden: { display: "none" },
  })

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

          <Timer
            initialTime={30000}
            direction="backward"
            checkpoints={[
              {
                time: 0,
                callback: () => requestUpdate(),
              },
            ]}
          >
            {() => (
              <>
                <Typography>
                  Retry in <Timer.Seconds /> seconds.
                </Typography>
              </>
            )}
          </Timer>
        </CardContent>
      </>
    )
  }

  const ApiResponseContent = () => {
    const snapshotImageAttr: ImgProps = {
      src: fixSnapshotUrl(status.settings?.webcam?.snapshotUrl || "", props.config.server),
      className: `rounded-corners ${status.settings?.webcam?.flipH ? "flip-horizontal" : ""} ${status.settings?.webcam?.flipV ? "flip-vertical" : ""} ${
        status.settings?.webcam?.flipH && status.settings?.webcam?.flipV ? "flip-horizontal-vertical" : ""
      }`,
    }

    return (
      <>
        <CardHeader
          title={status.printer?.state?.text}
          subheader={status.job?.job?.file?.display || `No Job Selected`}
          action={
            <IconButton onClick={requestUpdate}>
              <RefreshIcon />
            </IconButton>
          }
        />
        <CardContent>
          <Img {...snapshotImageAttr} style={{ width: "100%" }} loader={<CircularProgress />} />
          {status.job?.progress.printTimeOrigin !== null ? (
            <>
              <Typography>
                {Math.round(status.job?.progress?.completion || NaN)}%
                {(status.job?.progress?.printTimeLeft || 0) > 0 ? (
                  <>
                    {" ETA "}
                    <Moment add={{ seconds: status.job?.progress?.printTimeLeft }} fromNow>
                      {Date()}
                    </Moment>
                  </>
                ) : null}
              </Typography>
            </>
          ) : null}
          <Typography>
            tool0 {status.printer?.temperature?.tool0.actual}°C
            {status.printer?.temperature?.tool0.target || 0 > 0 ? <>-&gt; {status.printer?.temperature.tool0.target}°C</> : null}
          </Typography>
          <Typography>
            bed {status.printer?.temperature?.bed.actual}°C
            {status.printer?.temperature?.bed.target || 0 > 0 ? <>-&gt; {status.printer?.temperature.bed.target}°C</> : null}
          </Typography>
        </CardContent>
        <CardActions>
          <Timer
            initialTime={10000}
            direction="backward"
            checkpoints={[
              {
                time: 0,
                callback: () => requestUpdate(),
              },
            ]}
          >
            {() => (
              <>
                <Typography>
                  Update in <Timer.Seconds /> seconds.
                </Typography>
              </>
            )}
          </Timer>
        </CardActions>
      </>
    )
  }

  const hasError = () => {
    return status.settings == undefined || status.printer == undefined || status.job == undefined
  }

  return (
    <>
      <Card>
        <DisplayBox pose={hasError() ? "visible" : "hidden"}>
          <ErrorContent />
        </DisplayBox>
        <DisplayBox pose={!hasError() ? "visible" : "hidden"}>
          <ApiResponseContent />
        </DisplayBox>
      </Card>
    </>
  )
}

export default OctoprintStatus
