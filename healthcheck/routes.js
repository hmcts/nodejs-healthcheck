'use strict'
const checks = require('./checks'),
      outputs = require('./outputs'),
      versionFile = require('./versionFile');

function getBuildInfo(extra) {
  return Promise.all([
    versionFile.commit()
  ]).then(([commit]) => {
    let buildInfo = {
      environment: process.env.PACKAGES_ENVIRONMENT || "unknown",
      project: process.env.PACKAGES_PROJECT || "unknown",
      name: process.env.PACKAGES_NAME || "unknown",
      version: process.env.PACKAGES_VERSION || "unknown",
      commit,
    };
    if (extra) {
      return Object.assign(buildInfo, { extra });
    } else {
      return buildInfo;
    }
  });
}

function configure(config) {
  const check = new checks.CompositeCheck(config.checks);

  return (req, res) => {
    return Promise
      .all([check.call(), getBuildInfo(config.buildInfo)])
      .then(([results, buildInfo]) => {
        const allOk = Object.values(results)
                            .every(result => result.status === outputs.UP);
        const output = Object.assign(
          outputs.status(allOk),
          results,
          { buildInfo }
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
