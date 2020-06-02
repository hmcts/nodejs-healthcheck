'use strict'

const request = require('supertest')
const express = require('express')
const app = express()
const install = require('../../healthcheck/install')
const { expect } = require('../chai-sinon')

const validConfig = {
  checks: {},
  buildInfo: {
    'unit-testing': 'nodejs-healthcheck test'
  }
}

before(() => {
  install.addTo(app, validConfig)
})

describe('Testing liveness', function () {
  it('should return 200 OK', function (done) {
    request(app)
      .get('/health/liveness')
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err)
        }
        expect(res.body.status).to.be.equal('UP')
        done()
      })
  })
})

describe('Testing health for 200 OK', function () {
  it('should return 200 OK', function (done) {
    request(app)
      .get('/health')
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err)
        }
        expect(res.body.status).to.be.equal('UP')
        done()
      })
  })
})

describe('Testing readiness for 200 OK', function () {
  it('should return 200 OK', function (done) {
    request(app)
      .get('/health/readiness')
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err)
        }
        expect(res.body.status).to.be.equal('UP')
        done()
      })
  })
})
