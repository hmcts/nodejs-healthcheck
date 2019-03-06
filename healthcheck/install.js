'use strict'

const routes = require('./routes')
const outputs = require('./outputs')

function addTo(app, config) {
  app.get('/health', routes.configure(config))
  app.get('/health/liveness', (req, res) => res.json(outputs.status(outputs.UP)))
}

module.exports = {
  'addTo': addTo
}
