import React, { useState, useEffect } from "react"
import Moment from "react-moment"
import "./styles.css"
import Axios from "axios"
import Parse from "url-parse"
import store from "store2"

const OctoprintStatus = () => {
  const localStorageKeyConfig = "lsk_config"

  type Config = {
    server: string
    apiKey: string
    webcam: {
      flipped: boolean
    }
  }

  const [config, setConfig] = useState<Config>(
    store.get(localStorageKeyConfig, {
      server: "",
      apiKey: "",
      webcam: {
        flipped: false,
      },
    })
  )
  useEffect(() => {
    store.add(localStorageKeyConfig, config)
  }, [config])

  type Printer = {
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
    job: {
      file: {
        display: string
      }
    }
    progress: {
      completion: number
      printTimeLeft: number
    }
  }

  type Settings = {
    webcam: {
      snapshotUrl: string
    }
  }

  type Status = {
    updatedTs: number
    configValidated: boolean
    printer: Printer | undefined
    job: Job | undefined
    settings: Settings | undefined
  }

  const [state, setState] = useState<Status>({
    configValidated: false,
    updatedTs: Date.now(),
    printer: undefined,
    job: undefined,
    settings: undefined,
  })

  const reqGet = async (path: string) => {
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

  const validateConfig = async () => {
    if (state.configValidated) {
      console.log("already validated. ignoring this request.")
      return true
    }
    try {
      await reqGet("/api/version")
      setState({
        ...state,
        configValidated: true,
      })
      return true
    } catch (error) {
      setState({
        ...state,
        configValidated: false,
      })
      return false
    }
  }

  const requestUpdate = async () => {
    if (!state.configValidated) {
      console.error("invalid config. skipping requestUpdate().")
      return
    }
    const [s, p, j] = await Promise.all([reqGet("/api/settings"), reqGet("/api/printer"), reqGet("/api/job")])
    if (s && p && j) {
      setState({
        ...state,
        settings: s,
        printer: p,
        job: j,
        updatedTs: Date.now(),
        configValidated: true,
      })
    }
    console.dir(state)
  }

  const fixSnapshotUrl = (snapshotUrl: string): string => {
    try {
      const url = Parse(config.server)
      return `${snapshotUrl}&timestamp=${new Date().getTime()}`.replace("127.0.0.1", url.host).replace("localhost", url.host)
    } catch (error) {
      return "https://cataas.com/cat"
    }
  }

  const handleWebcamFlippedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setConfig({
      ...config,
      webcam: {
        ...config.webcam,
        flipped: event.target.checked,
      },
    })
  }

  return (
    <>
      <div>
        <div>
          <label>
            Server
            <input
              onChange={e => {
                setConfig({
                  ...config,
                  server: e.target.value,
                })
                setState({
                  ...state,
                  configValidated: false,
                })
              }}
              placeholder="e.g. http://octopi.local"
              defaultValue={config.server}
              onKeyPress={event => {
                if (event.key === "Enter") {
                  validateConfig()
                }
              }}
            />
          </label>
        </div>
        <div>
          <label>
            API Key
            <input
              onChange={e => {
                setConfig({
                  ...config,
                  apiKey: e.target.value,
                })
                setState({
                  ...state,
                  configValidated: false,
                })
              }}
              placeholder="Copy from Octopi (enable CORS)"
              defaultValue={config.apiKey}
              onKeyPress={event => {
                if (event.key === "Enter") {
                  validateConfig()
                }
              }}
            />
          </label>
        </div>
        <div>
          <input
            type="button"
            value="Save"
            onKeyPress={event => {
              if (event.key === "Enter") {
                validateConfig()
              }
            }}
            onClick={validateConfig}
          />
        </div>
      </div>
      <div onClick={requestUpdate}>
        {!state.configValidated ? (
          "invalid config. please check server and api key"
        ) : (
          <>
            <div>
              {state.printer?.state.text} - {Math.round(state.job?.progress.completion || NaN)}% finishing{" "}
              <Moment add={{ seconds: state.job?.progress.printTimeLeft }} fromNow>
                {Date()}
              </Moment>
            </div>
            <div>{state.job?.job.file.display}</div>
            <div>
              hotend {state.printer?.temperature.tool0.actual} -&gt; {state.printer?.temperature.tool0.target}
            </div>
            <div>
              {state.printer?.temperature.bed.actual} -&gt; {state.printer?.temperature.bed.target}
            </div>
            <div>
              <img src={fixSnapshotUrl(state.settings?.webcam.snapshotUrl || "")} className={config.webcam.flipped ? "img-hor-vert" : ""} />
              <label>
                flip?
                <input type="checkbox" checked={config.webcam.flipped} onChange={handleWebcamFlippedChange} />
              </label>
            </div>
          </>
        )}
      </div>
      <div>Octostatus - a lightweight octoprint status page</div>
    </>
  )
}

export default OctoprintStatus
