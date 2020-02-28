'use strict'

const checks  = require('./healthcheck/checks'),
      outputs = require('./healthcheck/outputs'),
      routes  = require('./healthcheck/routes'),
      install  = require('./healthcheck/install');

module.exports = {
  "addTo": install.addTo,
  "configure": routes.configure,
  // outputs
  "up": outputs.up,
  "down": outputs.down,
  "status": outputs.status,
  // checks
  "web": checks.WebCheck.create,
  "raw": checks.RawCheck.create,
};
