'use strict'
/* global describe, beforeEach, afterEach, it */

const { expect, sinon } = require('../chai-sinon')
const routes = require('../../healthcheck/routes')
const checks = require('../../healthcheck/checks')
const outputs = require('../../healthcheck/outputs')
const versionFile = require('../../healthcheck/versionFile')

describe('Routes', () => {
  const originalEnv = {}
  const envKeys = [
    'PACKAGES_ENVIRONMENT', 'PACKAGES_PROJECT', 'PACKAGES_NAME'
  ]

  beforeEach(() => {
    sinon.stub(versionFile, 'commit')
    sinon.stub(versionFile, 'date')
    sinon.stub(versionFile, 'version')
    versionFile.commit.resolves('abc1234')
    versionFile.date.resolves('Jan 1 1970')
    versionFile.version.resolves('1.4.3-42')
    envKeys.forEach(key => {
      originalEnv[key] = process.env[key]
      process.env[key] = 'test ' + key
    })
  })

  afterEach(() => {
    versionFile.commit.restore()
    versionFile.date.restore()
    versionFile.version.restore()
    envKeys.forEach(key => {
      if (typeof originalEnv[key] === 'undefined') {
        delete process.env[key]
      } else {
        process.env[key] = originalEnv[key]
      }
    })
  })

  describe('getBuildInfo', () => {
    it('should add build info from environment', () => {
      return expect(routes.getBuildInfo()).to.eventually.eql({
        environment: 'test PACKAGES_ENVIRONMENT',
        project: 'test PACKAGES_PROJECT',
        name: 'test PACKAGES_NAME',
        version: '1.4.3-42',
        commit: 'abc1234',
        date: 'Jan 1 1970'
      })
    })

    it('should include extra build info', () => {
      const extra = routes.getBuildInfo({ foo: 'bar' }).then(_ => _.extra)
      return expect(extra).to.eventually.eql({ foo: 'bar' })
    })
  })

  describe('configure', () => {
    const makeCheck = isOk => checks.RawCheck.create(() => isOk ? outputs.up() : outputs.down())
    const makeReqRes = (expectedStatus, expectedJson) => {
      const req = sinon.spy()
      const res = {}
      res.status = status => {
        expect(status).to.eql(expectedStatus)
        return res
      }
      res.json = json => {
        expect(json).to.eql(expectedJson)
        return res
      }
      return [req, res]
    }

    it('should return 200 OK if all checks pass', () => {
      const route = routes.configure({
        checks: {
          check1: makeCheck(true),
          check2: makeCheck(true)
        }
      })
      const [req, res] = makeReqRes(200, {
        status: outputs.UP,
        check1: { status: 'UP' },
        check2: { status: 'UP' },
        buildInfo: {
          environment: 'test PACKAGES_ENVIRONMENT',
          project: 'test PACKAGES_PROJECT',
          name: 'test PACKAGES_NAME',
          version: '1.4.3-42',
          commit: 'abc1234',
          date: 'Jan 1 1970'
        }
      })

      return route(req, res)
    })

    it('should return 503 DOWN if any checks fail', () => {
      const route = routes.configure({
        checks: {
          check1: makeCheck(false),
          check2: makeCheck(true)
        }
      })
      const [req, res] = makeReqRes(503, {
        status: 'DOWN',
        check1: { status: 'DOWN' },
        check2: { status: 'UP' },
        buildInfo: {
          environment: 'test PACKAGES_ENVIRONMENT',
          project: 'test PACKAGES_PROJECT',
          name: 'test PACKAGES_NAME',
          version: '1.4.3-42',
          commit: 'abc1234',
          date: 'Jan 1 1970'
        }
      })

      return route(req, res)
    })

    it('should return 200 and UP if readiness check is undefined', () => {
      const route = routes.checkReadiness()
      const [req, res] = makeReqRes(200, {
        status: 'UP'
      })

      return route(req, res)
    })

    it('should return 200 OK if all checks pass', () => {
      const route = routes.checkReadiness({
        check1: makeCheck(true),
        check2: makeCheck(true)
      })
      const [req, res] = makeReqRes(200, {
        status: outputs.UP,
        check1: { status: 'UP' },
        check2: { status: 'UP' }
      })

      return route(req, res)
    })

    it('should return 500 DOWN if any readiness checks fail', () => {
      const route = routes.checkReadiness({
        check1: makeCheck(false),
        check2: makeCheck(true)
      })
      const [req, res] = makeReqRes(500, {
        status: 'DOWN',
        check1: { status: 'DOWN' },
        check2: { status: 'UP' }
      })

      return route(req, res)
    })

    it('should return the extra build info', () => {
      const route = routes.configure({
        checks: {
          check1: makeCheck(true)
        },
        buildInfo: {
          foo: 'bar'
        }
      })
      const [req, res] = makeReqRes(200, {
        status: 'UP',
        check1: { status: 'UP' },
        buildInfo: {
          environment: 'test PACKAGES_ENVIRONMENT',
          project: 'test PACKAGES_PROJECT',
          name: 'test PACKAGES_NAME',
          version: '1.4.3-42',
          commit: 'abc1234',
          date: 'Jan 1 1970',
          extra: {
            foo: 'bar'
          }
        }
      })

      return route(req, res)
    })
  })
})
