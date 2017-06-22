'use strict'

const request = require('superagent'),
      checks  = require('./healthcheck/checks'),
      outputs = require('./healthcheck/outputs'),
      routes  = require('./healthcheck/routes');


module.exports = {
  "configure": routes.configure,
  // outputs
  "up": outputs.up,
  "down": outputs.down,
  "status": outputs.status,
  // checks
  "web": checks.WebCheck.create,
  "raw": checks.RawCheck.create,
};
