# Nodejs Healthcheck

[![Greenkeeper badge](https://badges.greenkeeper.io/hmcts/nodejs-healthcheck.svg)](https://greenkeeper.io/)

A library for adding reform standard compliant healthchecks to nodejs applications.

It exposes 3 endpoints:

1. `/health` - Returns 200 by default  along with `buildInfo`, can optionally include result evaluating all `checks` passed in config.
2. `/health/liveness` - Returns 200 always.
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

You can optionally include [readiness checks](#what-to-include-in-readiness-checks).

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

## what to include in readiness checks

- On Kubernetes, readiness probes will be called periodically throughout the lifetime of the container. Container will be made temporarily unavailable from serving traffic when the readiness check fails.
- The requests won't even reach your application to handle errors. So, it is very important to consider what checks should be included into readiness probe.
- While adding all dependant services to readiness check can help in identifying any misconfiguration during startup, it could cause unwanted downtime for the application.
- K8s introduced startUp Probes (Alpha in  1.16 ) to handle startup cases separately.

Based on above, you should include a dependency into readiness checks only if they are exclusive/hard dependencies for your service. Unavailability of soft dependencies needs to be handled in code to give appropriate customer experience.

Good example for check to be included in readiness:

- A private cache / database like `Redis` or `Elastic Search` which are exclusive to the application (not shared).

Bad example for check to be included in readiness:

- Any shared components like IDAM, S2S or CCD.


## Publishing

Bump the version (SemVer) and create a release in the GitHub UI, Travis CI will then build test and release to the npm registry.

## To Test

Run yarn install (if packages not downloaded) and then run yarn test to run unit tests
