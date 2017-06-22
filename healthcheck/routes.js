'use strict'
const checks = require('./checks'),
      outputs = require('./outputs');

function getBuildInfo(extra) {
  let buildInfo = {
    environment: process.env.PACKAGES_ENVIRONMENT || "unknown",
    project: process.env.PACKAGES_PROJECT || "unknown",
    name: process.env.PACKAGES_NAME || "unknown",
    version: process.env.PACKAGES_VERSION || "unknown",
  };
  if (extra) {
    buildInfo.extra = extra;
  }
  return buildInfo;
}

function configure(config) {
  const check = new checks.CompositeCheck(config.checks);

  return (req, res) => {
    check.call().then(results => {
      const allOk = Object.values(results)
                          .every(result => result.status === outputs.UP);
      const output = Object.assign(
        results,
        outputs.status(allOk),
        {
          buildInfo: getBuildInfo(config.buildInfo)
        }
      );
      const status = allOk ? 200 : 500;
      res.status(status).json(output);
    });
  }
}


module.exports = {
  "getBuildInfo": getBuildInfo,
  "configure": configure,
};
