'use strict'

const { expect, sinon } = require('../chai-sinon')
const checks = require('../../healthcheck/checks')
const nock = require('nock')

describe('Checks', () => {
  let check

  describe('web', () => {
    let request

    describe('basic web check', () => {
      beforeEach(() => {
        check = checks.WebCheck.create('https://example.com/status')
        request = nock('https://example.com').get('/status')
      })

      it('should return status UP on HTTP 200 OK', (done) => {
        request.reply(200, 'OK')

        check.call().then((result) => {
          expect(result).to.eql({ status: 'UP' })
          done()
        })
      });

      [201, 400, 500, 503].forEach((code) => {
        it('should return status DOWN on HTTP ' + code, (done) => {
          request.reply(code, 'SOMETHING')

          check.call().then((result) => {
            expect(result).to.contain({ status: 'DOWN' })
            done()
          })
        })
      })
    })

    describe('custom web check', () => {
      beforeEach(() => {
        check = new checks.WebCheck('https://example.com/status', {
          callback: (err, res) => {
            if (res.body.status === 'good') {
              return { status: 'UP' }
            } else {
              return { status: 'DOWN' }
            }
          }
        })
        request = nock('https://example.com').get('/status')
      })

      it('should return down on down condition', (done) => {
        request.reply(200, { status: 'bad' })

        check.call().then((result) => {
          expect(result).to.eql({ status: 'DOWN' })
          done()
        })
      })

      it('should return up on up condition', (done) => {
        request.reply(500, { status: 'good' })

        check.call().then((result) => {
          expect(result).to.eql({ status: 'UP' })
          done()
        })
      })
    })
  })

  describe('raw', () => {
    describe('basic raw check', () => {
      it('should output exactly what is provided', (done) => {
        const f = () => { return true }
        check = new checks.RawCheck(f)

        check.call().then((result) => {
          expect(result).to.eql(true)
          done()
        })
      })

      it('passes the express req and res to the callback', () => {
        const expressRequest = sinon.spy()
        const expressResponse = sinon.spy()
        const check = new checks.RawCheck((req, res) => {
          expect(req).to.eql(expressRequest)
          expect(res).to.eql(expressResponse)
        })
        return check.call(expressRequest, expressResponse)
      })
    })
  })

  describe('composite', () => {
    describe('basic composite check', () => {
      it('should output a map of composed check results', (done) => {
        const f1 = () => { return 'f1' }
        const f2 = () => { return 'f2' }
        check = new checks.CompositeCheck({
          c1: checks.RawCheck.create(f1),
          c2: checks.RawCheck.create(f2)
        })

        check.call().then((result) => {
          expect(result).to.eql({
            c1: 'f1',
            c2: 'f2'
          })
          done()
        })
      })

      it('passes the express req and res to the child checks', (done) => {
        const expressRequest = sinon.spy()
        const expressResponse = sinon.spy()
        const childCheck = new checks.RawCheck((req, res) => {
          expect(req).to.eql(expressRequest)
          expect(res).to.eql(expressResponse)
          done()
        })
        const check = new checks.CompositeCheck({
          child: childCheck
        })

        check.call(expressRequest, expressResponse)
      })
    })
  })
})
