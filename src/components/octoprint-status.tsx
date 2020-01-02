import "./styles.css"
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  createStyles,
  IconButton,
  Theme,
  Typography,
  withStyles,
  CardActions,
} from "@material-ui/core"
import RefreshIcon from "@material-ui/icons/Refresh"
import React, { useState, useEffect } from "react"
import Timer from "react-compound-timer"
import Moment from "react-moment"
import posed from "react-pose"
import Parse from "url-parse"
import Get from "../utils/octoprint-rest-api"
import { Config } from "./octostatus-config"

type Printer = {
  // http://docs.octoprint.org/en/master/api/datamodel.html#printer-related
  state: {
    text: string
  }
  temperature: {
    bed: {
      actual: number
      target: number
    }
    tool0: {
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
  job: Job | undefined
  printer: Printer | undefined
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
      return `${snapshotUrl}&timestamp=${new Date().getTime()}`
        .replace("127.0.0.1", url.host)
        .replace("localhost", url.host)
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
        <CardHeader title="Could not connect" />
        <CardContent>
          <Typography>Check server and API settings.</Typography>
        </CardContent>
        <CardActions>
          <RefreshTimer duration={30000} />
        </CardActions>
      </>
    )
  }

  const StyledBadge = withStyles((theme: Theme) =>
    createStyles({
      badge: {
        right: 4,
        top: 13,
        border: `2px solid ${theme.palette.background.paper}`,
        padding: "0 5px",
      },
    }),
  )(Badge)

  type RefreshTimerProps = {
    duration: number
  }
  const RefreshTimer = (props: RefreshTimerProps) => {
    return (
      <Timer
        initialTime={props.duration}
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
            <StyledBadge badgeContent={<Timer.Seconds />} color="primary">
              <IconButton onClick={requestUpdate}>
                <RefreshIcon />
              </IconButton>
            </StyledBadge>
          </>
        )}
      </Timer>
    )
  }

  const ApiResponseContent = () => {
    const webcamSnapshotAttr: any = {
      src: fixSnapshotUrl(status.settings?.webcam?.snapshotUrl || "", props.config.server),
      className: `rounded-corners ${status.settings?.webcam?.flipH ? "flip-horizontal" : ""} ${
        status.settings?.webcam?.flipV ? "flip-vertical" : ""
      } ${status.settings?.webcam?.flipH && status.settings?.webcam?.flipV ? "flip-horizontal-vertical" : ""}`,
    }
    const WebcamImage = () => {
      return <img {...webcamSnapshotAttr} style={{ width: "100%" }} />
    }

    return (
      <>
        <CardHeader
          title={status.printer?.state?.text}
          subheader={status.job?.job?.file?.display || `No Job Selected`}
        />
        <CardContent>
          <WebcamImage />
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
            {status.printer?.temperature?.tool0.target || 0 > 0 ? (
              <>-&gt; {status.printer?.temperature.tool0.target}°C</>
            ) : null}
          </Typography>
          <Typography>
            bed {status.printer?.temperature?.bed.actual}°C
            {status.printer?.temperature?.bed.target || 0 > 0 ? (
              <>-&gt; {status.printer?.temperature.bed.target}°C</>
            ) : null}
          </Typography>
        </CardContent>
        <CardActions>
          <RefreshTimer duration={10000} />
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
