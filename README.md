# Nodejs Healthcheck

[![Greenkeeper badge](https://badges.greenkeeper.io/hmcts/nodejs-healthcheck.svg)](https://greenkeeper.io/)

A library for adding reform standard compliant healthchecks to nodejs applications.

## Usage

Configure an express.js handler with checks.

```javascript
const healthcheck = require('@hmcts/nodejs-healthcheck');

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
}));
```

## Publishing

We use Travis for publishing via build pipelines once code has been merged.

## To Test

Run yarn install (if packages not downloaded) and then run yarn test to run unit tests
