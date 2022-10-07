'use strict'
const checks = require('./checks')
const outputs = require('./outputs')
const versionFile = require('./versionFile')

const { Logger } = require('@hmcts/nodejs-logging')
const logger = Logger.getLogger('@hmcts/nodejs-logging/routes')

function getBuildInfo (extra) {
  return Promise.all([
    versionFile.version(),
    versionFile.commit(),
    versionFile.date()
  ]).then(([version, commit, date]) => {
    const buildInfo = {
      environment: process.env.PACKAGES_ENVIRONMENT || process.env.REFORM_ENVIRONMENT || 'unknown',
      project: process.env.PACKAGES_PROJECT || process.env.REFORM_TEAM || 'unknown',
      name: process.env.PACKAGES_NAME || process.env.REFORM_SERVICE_NAME || 'unknown',
      version,
      commit,
      date
    }
    if (extra) {
      return Object.assign(buildInfo, { extra })
    } else {
      return buildInfo
    }
  })
}

function configure (config) {
  const check = new checks.CompositeCheck(config.checks)

  return (req, res) => {
    return Promise
      .all([check.call(req, res), getBuildInfo(config.buildInfo)])
      .then(([results, buildInfo]) => {
        const allOk = Object.values(results)
          .every(result => result.status === outputs.UP)
        const output = Object.assign(
          outputs.status(allOk),
          results,
          { buildInfo }
        )
        const status = allOk ? 200 : 503
        if (!allOk) {
          const downHealthChecks = Object.values(results)
            .filter(result => result.status === outputs.DOWN)

          logger.error('Health check failed, result for down endpoints: ', JSON.stringify(downHealthChecks))
        }
        res.status(status).json(output)
      })
  }
}

function checkReadiness (readinessChecks = {}) {
  const check = new checks.CompositeCheck(readinessChecks)

  return (req, res) => {
    return Promise
      .resolve(check.call(req, res))
      .then((results) => {
        const allOk = Object.values(results)
          .every((result) => result.status === outputs.UP)
        const output = Object.assign(
          outputs.status(allOk),
          results
        )
        const status = allOk ? 200 : 500
        if (!allOk) {
          const downHealthChecks = Object.values(results)
            .filter((result) => result.status === outputs.DOWN)

          logger.error('Health check failed, result for down endpoints: ', JSON.stringify(downHealthChecks))
        }
        res.status(status).json(output)
      })
  }
}

module.exports = {
  getBuildInfo: getBuildInfo,
  configure: configure,
  checkReadiness: checkReadiness
}
