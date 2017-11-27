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

  describe('version', () => {
    it('should resolve the version', () => {
      fs.readFile.resolves('version: 1.4.3\nbuild: 42');
      return expect(versionFile.version()).to.eventually.eql('1.4.3-42');
    });

    it('should resolve the version even if build is missing', () => {
      fs.readFile.resolves('version: 1.4.3');
      return expect(versionFile.version()).to.eventually.eql('1.4.3');
    });

    it('should resolve "unknown" if no version present in version file but build is there', () => {
      fs.readFile.resolves('build: 42');
      return expect(versionFile.version()).to.eventually.eql('unknown');
    });


    it('should resolve "unknown" if no versionFile present', () => {
      fs.readFile.rejects('no file found');
      return expect(versionFile.version()).to.eventually.eql('unknown');
    });

    it('should resolve "unknown" if no version present in version file', () => {
      fs.readFile.resolves('foo: bar');
      return expect(versionFile.version()).to.eventually.eql('unknown');
    });
  });


  describe('commit', () => {
    it('should resolve the commit sha', () => {
      fs.readFile.resolves('commit: abc1234');
      return expect(versionFile.commit()).to.eventually.eql('abc1234');
    });
    it('should resolve "unknown" if no versionFile present', () => {
      fs.readFile.rejects('no file found');
      return expect(versionFile.commit()).to.eventually.eql('unknown');
    });
    it('should resolve "unknown" if no commit present in version file', () => {
      fs.readFile.resolves('foo: bar');
      return expect(versionFile.commit()).to.eventually.eql('unknown');
    });
  });

  describe('date', () => {
    it('should resolve the built date', () => {
      fs.readFile.resolves('date: Jan 1 1970');
      return expect(versionFile.date()).to.eventually.eql('Jan 1 1970');
    });
    it('should resolve "unknown" if no versionFile present', () => {
      fs.readFile.rejects('no file found');
      return expect(versionFile.date()).to.eventually.eql('unknown');
    });
    it('should resolve "unknown" if no commit present in version file', () => {
      fs.readFile.resolves('foo: bar');
      return expect(versionFile.date()).to.eventually.eql('unknown');
    });
  });
});
