# Octostatus 🐙

![Screenshot](https://i.imgur.com/4ABMfBP.jpg)

### What?

A lightweight alternative way to monitor your [OctoPrint](https://octoprint.org/) server. I built this React client-side single page webapp to make HTTP API calls to your OctoPrint server directly. Under the hood, it uses Gatsby.js

### Why?

The web interface of OctoPrint can take a long time to load on mobile devices. I want to allow all devices to monitor print status with just a browser, and it should ideally load in under 2 seconds.

### Where?

http://octostatus.wafflepanda.com

### How?

1. On your OctoPrint server, copy your API key and ensure ☑ Allow Cross Origin Resource Sharing (CORS) is <u>checked</u>. Restart your OctoPrint server if necessary.
   `⚙ Settings > API`

2. Navigate to http://octostatus.wafflepanda.com

   You could pass in `?server=[octoprint url]&apiKey=[api key]`

3. Enter your `server` and `API key` into the boxes. These will be saved to your browser's local storage so you do not need to enter it anymore.

   If you prefer, bookmark the permalink for next time to auto-fill the fields.

### Known Issues

- _Could not connect - Check server and API settings_

  This app does not magically resolve network issues. If you cannot reach your the regular OctoPrint interface, then you will need to

- _http mixed content error_

  If you somehow end up hosting this yourself or accessing it via HTTPS, you will need to find your own way to serve OctoPrint API over https as well.

### Bugs and Feedback

File an [issue](https://github.com/alexleekt/gatsby-octoprint-status/issues), check out the [code](https://github.com/alexleekt/gatsby-octoprint-status), or submit a [pull request](https://github.com/alexleekt/gatsby-octoprint-status/pulls).

### Donation

If you enjoyed this, consider sending me a cup of coffee ☕ via [PayPal](https://www.paypal.me/alexleekt)

---

Made by @alexleekt
