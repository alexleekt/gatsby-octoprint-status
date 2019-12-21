import React, { useState, useEffect } from "react"
import Moment from "react-moment"
import "./styles.css"
import Axios from "axios"
import * as parse from "url-parse"

// local storage keys
const lsk_config = "lsk_config"

const OctoprintStatus = props => {
  const [config, setConfig] = useState(
    JSON.parse(localStorage.getItem(lsk_config)) || {
      server: "",
      apiKey: "",
      validated: false,
    }
  )
  useEffect(() => {
    localStorage.setItem(lsk_config, JSON.stringify(config))
    requestUpdate()
    setInterval(() => {
      requestUpdate()
    }, 60 * 1000)
  }, [config])

  const [state, setState] = useState({
    lastUpdated: 0,
    printer: {},
    job: {},
    settings: {},
  })

  const validateConfig = async event => {
    if (config.validated) {
      console.log("already validated. ignoring this request.")
      return true
    }
    try {
      const response = await reqGet("/api/settings")
      setConfig({
        ...config,
        validated: true,
      })
      return true
    } catch (error) {
      setConfig({
        ...config,
        validated: false,
      })
      return false
    }
  }

  const requestUpdate = async () => {
    if (!config.validated) {
      console.error("invalid config. skipping requestUpdate().")
      return
    }
    const [s, p, j] = await Promise.all([reqGet("/api/settings"), reqGet("/api/printer"), reqGet("/api/job")])
    setState({
      ...state,
      settings: s,
      printer: p,
      job: j,
      lastUpdated: Date.now(),
    })

    console.dir(state)
  }

  const reqGet = async path => {
    try {
      const response = await Axios.get(`${config.server}${path}`, {
        method: "get",
        timeout: 1000,
        headers: {
          "X-Api-Key": config.apiKey,
        },
      })
      return response.data
    } catch (error) {
      // Error 😨
      if (error.response) {
        /*
         * The request was made and the server responded with a
         * status code that falls out of the range of 2xx
         */
        console.log(error.response.data)
        console.log(error.response.status)
        console.log(error.response.headers)
      } else if (error.request) {
        /*
         * The request was made but no response was received, `error.request`
         * is an instance of XMLHttpRequest in the browser and an instance
         * of http.ClientRequest in Node.js
         */
        console.log(error.request)
      } else {
        // Something happened in setting up the request and triggered an Error
        console.log("Error", error.message)
      }
      console.log(error.config)
    }
  }

  const snapshotUrl = () => {
    try {
      const url = parse(config.server)
      return `${state.settings.webcam.snapshotUrl.replace("127.0.0.1", url.host)}&timestamp=${new Date().getTime()}`
    } catch (error) {
      return "https://cataas.com/cat"
    }
  }

  return (
    <>
      <div>
        <div>
          <input
            onChange={e =>
              setConfig({
                ...config,
                validated: false,
                server: e.target.value,
              })
            }
            placeholder="e.g. http://octopi.local"
            defaultValue={config.server}
            onKeyPress={event => {
              if (event.key === "Enter") {
                validateConfig(event)
              }
            }}
          />
        </div>
        <div>
          <input
            onChange={e =>
              setConfig({
                ...config,
                validated: false,
                apiKey: e.target.value,
              })
            }
            placeholder="Copy from Octopi (enable CORS)"
            defaultValue={config.apiKey}
            onKeyPress={event => {
              if (event.key === "Enter") {
                validateConfig(event)
              }
            }}
          />
        </div>
        <div>
          <input
            type="button"
            value="Save"
            onKeyPress={event => {
              if (event.key === "Enter") {
                validateConfig(event)
              }
            }}
            onClick={validateConfig}
          />
        </div>
      </div>
      <div onClick={requestUpdate}>
        {state.lastUpdated === 0 || !config.validated ? (
          "invalid config. please check server and api key"
        ) : (
          <>
            <div>
              {state.printer.state.text} - {Math.round(state.job.progress.completion)}% finishing{" "}
              <Moment add={{ seconds: state.job.progress.printTimeLeft }} fromNow>
                {Date()}
              </Moment>
            </div>
            <div>{state.job.job.file.display}</div>
            <div>
              hotend {state.printer.temperature.tool0.actual} -> {state.printer.temperature.tool0.target}
            </div>
            <div>
              bed {state.printer.temperature.bed.actual} -> {state.printer.temperature.bed.target}
            </div>
            <div>
              <img src={snapshotUrl()} className="img-hor-vert" />
            </div>
          </>
        )}
      </div>
    </>
  )
}

export default OctoprintStatus
