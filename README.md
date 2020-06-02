# Nodejs Healthcheck

[![Greenkeeper badge](https://badges.greenkeeper.io/hmcts/nodejs-healthcheck.svg)](https://greenkeeper.io/)

A library for adding reform standard compliant healthchecks to nodejs applications.

It exposes 3 endpoints:

1. `/health` - Returns 200 by default  along with `buildInfo`, can optionally include result evaluating all `checks` passed in config.
2. `/health/livness` - Returns 200 always.
3. `/health/readiness` - Returns 200 by default , can optionally include result evaluating all `readinessChecks` passed in config.

## Usage

Configure an express.js handler with checks.

```javascript
const config = {
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
};
healthcheck.addTo(app, config);
```

You can optionally include some readiness checks.

```javascript
const config = {
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
  readinessChecks: {
    mySimpleWebCheck: healthcheck.web("https://example.com/status")
  },
  buildInfo: {
    myCustomBuildInfo: "yay"
  }
};
healthcheck.addTo(app, config);
```

## Publishing

Bump the version (SemVer) and create a release in the GitHub UI, Travis CI will then build test and release to the npm registry.

## To Test

Run yarn install (if packages not downloaded) and then run yarn test to run unit tests
