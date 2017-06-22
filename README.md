# Nodejs Healthcheck

A library for adding reform standard compliant healthchecks to nodejs applications.

## Usage

Configure an express.js handler with checks.

```javascript
const healthcheck = require('nodejs-healthcheck');

app.get("/status", healthcheck.configure({
  checks: {
    mySimpleWebCheck: healthcheck.web("https://example.com/status"),
    myComplexWebCheck: healthcheck.web("https://example.com/other", {
      callback: (err, res) => {
        return res.body.status == "good" ? healthcheck.up() : healthcheck.down()
      },
      timeout: 5000,
      deadline: 10000,
    }),
    myRawCheck: healthcheck.raw(() => {
      return myInternalCheck() ? healthcheck.up() : healthcheck.down()
    })
  },
  buildInfo: {
    myCustomBuildInfo: "yay"
  }
});
```

## Publishing

To package and publish use the Makefile target. This requires your artifactory API key to be set to an
environment variable called `JFROG_API_KEY`. You can get your key from [your artifactory profile](https://artifactory.reform.hmcts.net/artifactory/webapp/#/profile).

```
JFROG_API_KEY=fake-key make publish
```
