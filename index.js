'use strict'

const checks = require('./healthcheck/checks')
const outputs = require('./healthcheck/outputs')
const routes = require('./healthcheck/routes')
const install = require('./healthcheck/install')

module.exports = {
  addTo: install.addTo,
  configure: routes.configure,
  // outputs
  up: outputs.up,
  down: outputs.down,
  status: outputs.status,
  // checks
  web: checks.WebCheck.create,
  raw: checks.RawCheck.create
}
