import React, { useState, useEffect } from "react"
import Moment from "react-moment"
import './styles.css'

const _apiKey = "";
const _server = "";

// local storage keys
const lsk_config = "lsk_config";

const OctoprintStatus = props => {
  const [config, setConfig] = useState(
    JSON.parse(localStorage.getItem(lsk_config)) || {
      server: _server,
      apiKey: _apiKey,
      validated: false,
    }
  )
  useEffect(() => {
    localStorage.setItem(lsk_config, JSON.stringify(config));
    requestUpdate();
  }, [config]);

  const [state, setState] = useState({
    lastUpdated: 0,
    printer: {},
    job: {},
    settings: {},
  });



  const validateConfig = async (event) => {
    // TODO implement real check
    const result = await reqGet("/api/settings")
    setConfig({
      ...config,
      validated: true,
    })
  }

  const requestUpdate = async () => {
    if (!config.validated) {
      console.error("invalid config.");
      return;
    }
    const [p, j] = await Promise.all([ reqGet('/api/printer'), reqGet('/api/job')])
    setState({
      ...state,
      printer: p,
      job: j,
      lastUpdated: Date.now()
    })
  }

  const reqGet = (path) => {
    return fetch(`${config.server}${path}`, {
        method: "get",
        headers: {
          "X-Api-Key": config.apiKey,
        },
      })
      .then(function(response) {
        return response.json()
      })
  }

  return (
    <>
      <div>
        <div>
          <input
            onChange={e => setConfig({
              ...config,
              validated: false,
              server: e.target.value,
              })}
            placeholder="e.g. http://octopi.local"
            defaultValue={config.server}
            />
        </div>
        <div>
          <input
            onChange={e => setConfig({
              ...config,
              validated: false,
              apiKey: e.target.value,
              })}
            placeholder="Copy from Octopi (enable CORS)"
            defaultValue={config.apiKey}
            />
        </div>
        <div>
          <input
            type="button"
            value="Save"
            onSubmit={validateConfig}
            onClick={validateConfig}
            />
        </div>
      </div>
      <div onClick={requestUpdate}>
        {state.lastUpdated === 0 ? (
          "not loaded"
        ) : (
          <>
            <div>
              {state.printer.state.text} - {Math.round(state.job.progress.completion)}% ({Math.round(state.job.progress.printTimeLeft / 60)} min) <Moment duration={state.job.progress.printTimeLeft} durationFromNow></Moment>
            </div>
            <div>{state.job.job.file.display}</div>
            <div>
              hotend {state.printer.temperature.tool0.actual} -> {state.printer.temperature.tool0.target}
            </div>
            <div>
              bed {state.printer.temperature.bed.actual} -> {state.printer.temperature.bed.target}
            </div>
            <div>
            <img
              src={`${config.server}/webcam/?action=snapshot&timestamp=${new Date().getTime()}`}
              className="img-hor-vert"
              />
            </div>
          </>
        )}
      </div>
    </>
  )
}

export default OctoprintStatus
