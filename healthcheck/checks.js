'use strict'

const request = require('superagent')
const outputs = require('./outputs')

class WebCheck {
  constructor (url, options = {}) {
    this.url = url
    this.callback = options.callback || this.defaultCallback
    this.timeout = options.timeout || 2000
    this.deadline = options.deadline || 5000
    this.ca = options.ca
  }

  static create (url, options = {}) {
    return new WebCheck(url, options)
  }

  defaultCallback (err, res) {
    return !err && res.status === 200 ? outputs.up() : outputs.down(err)
  }

  call () {
    return new Promise((resolve) => {
      request
        .get(this.url)
        .ca(this.ca)
        .timeout({ response: this.timeout, deadline: this.deadline })
        .end((err, res) => {
          resolve(this.callback(err, res))
        })
    })
  }
}

class RawCheck {
  constructor (callback) {
    this.callback = callback
  }

  static create (callback) {
    return new RawCheck(callback)
  }

  call (req, res) {
    return new Promise((resolve) => {
      resolve(this.callback(req, res))
    })
  }
}

class CompositeCheck {
  constructor (checks) {
    this.checks = checks
  }

  static create (checks) {
    return new CompositeCheck(checks)
  }

  call (req, res) {
    const checks = Object.entries(this.checks)
    const promises = checks.map(check => check[1].call(req, res))
    const all = Promise.all(promises)

    return new Promise(resolve => {
      all.then(results => {
        resolve(
          results
            .map((result, i) => [checks[i][0], result])
            .reduce((prev, curr) => Object.assign(prev, { [curr[0]]: curr[1] }), {}))
      })
    })
  }
}

module.exports = {
  WebCheck: WebCheck,
  RawCheck: RawCheck,
  CompositeCheck: CompositeCheck
}
