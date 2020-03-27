import Axios from "axios"

const Get = async (server: string, apiKey: string, path: string) => {
  try {
    const response = await Axios.get(`${server}${path}`, {
      method: "get",
      timeout: 5000,
      headers: {
        "x-api-key": apiKey || ""
      },
    })
    if (response.headers["content-type"] === "application/json") {
      return response.data
    } else {
      throw {
        message: `unexpected content-type: ${response.headers["content-type"]}`,
        response: response,
      }
    }
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

export default Get
