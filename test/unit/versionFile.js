'use strict'
/* global describe, beforeEach, afterEach, it */

const {expect, sinon} = require('../chai-sinon');
const fs = require('fs-extra');
const versionFile = require('../../healthcheck/versionFile');

describe('versionFile', () => {

  beforeEach(() => {
    sinon.stub(fs, 'readFile');
  });

  afterEach(() => {
    fs.readFile.restore();
  });

  describe('commit', () => {
    it('should resolve the commit sha', () => {
      fs.readFile.resolves('commit: abc1234');
      return expect(versionFile.commit()).to.eventually.eql('abc1234');
    });
    it('should resolve "unkown" if no versionFile present', () => {
      fs.readFile.rejects('no file found');
      return expect(versionFile.commit()).to.eventually.eql('unknown');
    });
    it('should resolve "unkown" if no commit present in version file', () => {
      fs.readFile.resolves('foo: bar');
      return expect(versionFile.commit()).to.eventually.eql('unknown');
    });
  });

  describe('date', () => {
    it('should resolve the built date', () => {
      fs.readFile.resolves('date: Jan 1 1970');
      return expect(versionFile.date()).to.eventually.eql('Jan 1 1970');
    });
    it('should resolve "unkown" if no versionFile present', () => {
      fs.readFile.rejects('no file found');
      return expect(versionFile.date()).to.eventually.eql('unknown');
    });
    it('should resolve "unkown" if no commit present in version file', () => {
      fs.readFile.resolves('foo: bar');
      return expect(versionFile.date()).to.eventually.eql('unknown');
    });
  });
});
