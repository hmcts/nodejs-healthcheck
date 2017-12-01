'use strict'
const checks = require('./checks'),
      outputs = require('./outputs'),
      versionFile = require('./versionFile');

function getBuildInfo(extra) {
  return Promise.all([
    versionFile.version(),
    versionFile.commit(),
    versionFile.date()
  ]).then(([version, commit, date]) => {
    let buildInfo = {
      environment: process.env.PACKAGES_ENVIRONMENT || process.env.REFORM_ENVIRONMENT || "unknown",
      project: process.env.PACKAGES_PROJECT || process.env.REFORM_TEAM || "unknown",
      name: process.env.PACKAGES_NAME || process.env.REFORM_SERVICE_NAME || "unknown",
      version,
      commit,
      date
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
      .all([check.call(req, res), getBuildInfo(config.buildInfo)])
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
