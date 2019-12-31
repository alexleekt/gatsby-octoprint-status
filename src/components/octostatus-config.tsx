import React, { useState, useEffect } from "react"
import store from "store2"
import { FormGroup, TextField } from "@material-ui/core"
import { useDebounce } from "use-debounce"
import urlRegex from "url-regex"
import queryString from "query-string"
import objectAssignDefined from "object-assign-defined"
import { WindowLocation as WLocation } from "@reach/router"

export type Config = {
  server: string
  apiKey: string
}

type Props = {
  onConfigChanged: Function
  location?: WLocation
  config?: Config
}
export const OctostatusConfigForm = (props: Props) => {
  const debounceDuration = 1000
  const localStorageKeyConfig = "lsk_config"

  const parsed = queryString.parse(props.location?.search || "") as Config

  const [config, setConfig] = useState<Config>(
    objectAssignDefined(
      store.get(localStorageKeyConfig, {
        server: props.config?.server || "",
        apiKey: props.config?.apiKey || "",
      }),
      { server: parsed.server, apiKey: parsed.apiKey }
    )
  )
  useEffect(() => {
    store.add(localStorageKeyConfig, config)
  }, [config])

  const [debouncedConfig] = useDebounce(config, debounceDuration)
  useEffect(() => {
    props.onConfigChanged(debouncedConfig)
  }, [debouncedConfig])

  const validUrl = (subject: string): boolean => {
    return urlRegex({ exact: true }).test(subject)
  }

  return (
    <>
      <FormGroup row>
        <TextField
          autoComplete="false"
          autoCorrect="false"
          label="Server"
          variant="outlined"
          required
          fullWidth
          margin="dense"
          error={!validUrl(config.server)}
          helperText={!validUrl(config.server) ? "Invalid URL" : ""}
          onChange={e => {
            setConfig({
              ...config,
              server: e.target.value,
            })
          }}
          placeholder="e.g. http://octopi.local"
          value={config.server}
          InputLabelProps={{ shrink: config.server !== undefined }}
        />
        <TextField
          autoComplete="false"
          autoCorrect="false"
          label="API Key"
          variant="outlined"
          fullWidth
          margin="dense"
          onChange={e => {
            setConfig({
              ...config,
              apiKey: e.target.value,
            })
          }}
          placeholder="Copy from Octopi (make sure to enable CORS)"
          value={config.apiKey}
          InputLabelProps={{ shrink: config.apiKey !== undefined }}
        />
      </FormGroup>
    </>
  )
}
