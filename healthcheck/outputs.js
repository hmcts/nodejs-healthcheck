'use strict'

const UP = 'UP'
const DOWN = 'DOWN'

function up (extra = {}) {
  return status(true, extra)
}

function down (extra = {}) {
  return status(false, extra)
}

function status (s, extra = {}) {
  return Object.assign({}, extra, {
    status: s ? UP : DOWN
  })
}

module.exports = {
  up: up,
  down: down,
  status: status,
  UP: UP,
  DOWN: DOWN
}
