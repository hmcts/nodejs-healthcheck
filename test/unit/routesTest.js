'use strict'
/* global describe, beforeEach, afterEach, it */

const {expect, sinon} = require('../chai-sinon'),
      routes = require('../../healthcheck/routes'),
      checks = require('../../healthcheck/checks'),
      outputs = require('../../healthcheck/outputs'),
      versionFile = require('../../healthcheck/versionFile'),
      nock = require('nock');


describe('Routes', () => {
  let originalEnv = {};
  const envKeys = [
    'PACKAGES_ENVIRONMENT', 'PACKAGES_PROJECT',
    'PACKAGES_NAME', 'PACKAGES_VERSION'
  ];

  beforeEach(() => {
    sinon.stub(versionFile, 'commit');
    versionFile.commit.resolves('abc1234');
    envKeys.forEach(key => {
      originalEnv[key] = process.env[key];
      process.env[key] = "test " + key;
    });
  });

  afterEach(() => {
    versionFile.commit.restore();
    envKeys.forEach(key => {
      if (typeof originalEnv[key] === "undefined") {
        delete process.env[key];
      } else {
        process.env[key] = originalEnv[key];
      }
    });
  });


  describe('getBuildInfo', () => {

    it('should add build info from environment', () => {
      return expect(routes.getBuildInfo()).to.eventually.eql({
        environment: "test PACKAGES_ENVIRONMENT",
        project: "test PACKAGES_PROJECT",
        name: "test PACKAGES_NAME",
        version: "test PACKAGES_VERSION",
        commit: 'abc1234'
      });
    });

    it('should include extra build info', () => {
      const extra = routes.getBuildInfo({ foo: "bar" }).then(_ => _.extra);
      return expect(extra).to.eventually.eql({ foo: "bar" });
    });

  });

  describe('configure', () => {
    let makeCheck = isOk => checks.RawCheck.create(() => isOk ? outputs.up() : outputs.down());
    let makeReqRes = (expectedStatus, expectedJson) => {
      let req = sinon.spy(),
          res = {};
      res.status = status => {
        expect(status).to.eql(expectedStatus);
        return res;
      };
      res.json = json => {
        expect(json).to.eql(expectedJson);
        return res;
      };
      return [req, res];
    };

    it('should return 200 OK if all checks pass', () => {
      let route = routes.configure({
        checks: {
          check1: makeCheck(true),
          check2: makeCheck(true),
        }
      });
      let [req, res] = makeReqRes(200, {
        status: outputs.UP,
        check1: {status: "UP"},
        check2: {status: "UP"},
        buildInfo: {
          environment: "test PACKAGES_ENVIRONMENT",
          project: "test PACKAGES_PROJECT",
          name: "test PACKAGES_NAME",
          version: "test PACKAGES_VERSION",
          commit: 'abc1234'
        }
      });

      return route(req, res);
    });

    it('should return 500 DOWN if any checks fail', () => {
      let route = routes.configure({
        checks: {
          check1: makeCheck(false),
          check2: makeCheck(true),
        }
      });
      let [req, res] = makeReqRes(500, {
        status: "DOWN",
        check1: {status: "DOWN"},
        check2: {status: "UP"},
        buildInfo: {
          environment: "test PACKAGES_ENVIRONMENT",
          project: "test PACKAGES_PROJECT",
          name: "test PACKAGES_NAME",
          version: "test PACKAGES_VERSION",
          commit: 'abc1234'
        }
      });

      return route(req, res);

    });

    it('should return the extra build info', () => {
      let route = routes.configure({
        checks: {
          check1: makeCheck(true)
        },
        buildInfo: {
          foo: "bar"
        }
      });
      let [req, res] = makeReqRes(200, {
        status: "UP",
        check1: {status: "UP"},
        buildInfo: {
          environment: "test PACKAGES_ENVIRONMENT",
          project: "test PACKAGES_PROJECT",
          name: "test PACKAGES_NAME",
          version: "test PACKAGES_VERSION",
          commit: 'abc1234',
          extra: {
            foo: "bar"
          }
        }
      });

      return route(req, res);
    });

  });

});
