'use strict'

const routes = require('./routes')
const outputs = require('./outputs')

function addTo(app, config) {
  console.log("adding healthCheck ")
  app.get('/health', routes.configure(config))
  console.log("adding liveness")
  app.get('/health/liveness', (req, res) => res.status(200).json(outputs.status(outputs.UP)))
}

module.exports = {
  'addTo': addTo
}
