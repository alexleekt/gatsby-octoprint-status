import React, { useState, useEffect } from "react"
import store from "store2"
import "./styles.css"
import { FormGroup, TextField } from "@material-ui/core"
import { useDebounce } from "use-debounce"
import urlRegex from "url-regex"

export type Config = {
  server: string
  apiKey: string
}

type Props = {
  onConfigChanged: Function
}
export const OctostatusConfigForm = (props: Props) => {
  const debounceDuration = 1000
  const localStorageKeyConfig = "lsk_config"

  const [config, setConfig] = useState<Config>(
    store.get(localStorageKeyConfig, {
      server: "",
      apiKey: "",
    })
  )
  useEffect(() => {
    store.add(localStorageKeyConfig, config)
  }, [config])

  const [debouncedConfig] = useDebounce(config, debounceDuration)
  useEffect(() => {
    props.onConfigChanged(debouncedConfig)
  }, [debouncedConfig])

  return (
    <form noValidate autoComplete="off">
      <FormGroup row>
        <TextField
          label="Server"
          variant="outlined"
          required
          fullWidth
          margin="dense"
          error={!urlRegex({ exact: true }).test(config.server)}
          onChange={e => {
            setConfig({
              ...config,
              server: e.target.value,
            })
          }}
          placeholder="e.g. http://octopi.local"
          defaultValue={config.server}
        />
        <TextField
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
          defaultValue={config.apiKey}
        />
      </FormGroup>
    </form>
  )
}
