'use strict'
/* global describe, beforeEach, afterEach, it */

const { expect, sinon } = require('../chai-sinon')
const fs = require('fs').promises
const versionFile = require('../../healthcheck/versionFile')

describe('versionFile', () => {
  beforeEach(() => {
    sinon.stub(fs, 'readFile')
  })

  afterEach(() => {
    fs.readFile.restore()
  })

  describe('version', () => {
    it('should resolve the version', () => {
      fs.readFile.resolves('version: 1.4.3\nnumber: 42')
      return expect(versionFile.version()).to.eventually.eql('1.4.3-42')
    })

    it('should resolve the version even if build is missing', () => {
      fs.readFile.resolves('version: 1.4.3')
      return expect(versionFile.version()).to.eventually.eql('1.4.3')
    })

    it('should resolve "unknown" if no version present in version file but build is there', () => {
      fs.readFile.resolves('build: 42')
      return expect(versionFile.version()).to.eventually.eql('unknown')
    })

    it('should resolve "unknown" if no versionFile present', () => {
      fs.readFile.rejects('no file found')
      return expect(versionFile.version()).to.eventually.eql('unknown')
    })

    it('should resolve "unknown" if no version present in version file', () => {
      fs.readFile.resolves('foo: bar')
      return expect(versionFile.version()).to.eventually.eql('unknown')
    })

    describe('version with Environment Variables', () => {
      let versionFileWithEnv

      beforeEach(() => {
        process.env.PACKAGES_VERSION = 'v1.42'
        process.env.PACKAGES_VERSION = 'v1.42'
        versionFileWithEnv = require('../../healthcheck/versionFile')
      })

      afterEach(() => {
        delete process.env.PACKAGES_VERSION
        delete process.env.PACKAGES_VERSION
      })

      it('should resolve the version to Version even with Environment Variables', () => {
        fs.readFile.resolves('version: 1.4.3\nnumber: 42')
        return expect(versionFileWithEnv.version()).to.eventually.eql('1.4.3-42')
      })

      it('should resolve the version even if build is missing even with Environment Variables', () => {
        fs.readFile.resolves('version: 1.4.3')
        return expect(versionFile.version()).to.eventually.eql('1.4.3')
      })

      it('should resolve the version to Environment Variables if no version present in version file but build is there', () => {
        fs.readFile.resolves('number: 42')
        return expect(versionFile.version()).to.eventually.eql('v1.42')
      })

      it('should resolve the version to Environment Variables "v1.42" when versionFile has no version', () => {
        fs.readFile.resolves('foo: bar')
        return expect(versionFileWithEnv.version()).to.eventually.eql('v1.42')
      })

      it('should resolve the version to Environment Variables "v1.42" when no versionFile exists', () => {
        fs.readFile.rejects('no file found')
        return expect(versionFileWithEnv.version()).to.eventually.eql('v1.42')
      })
    })
  })

  describe('commit', () => {
    it('should resolve the commit sha', () => {
      fs.readFile.resolves('commit: abc1234')
      return expect(versionFile.commit()).to.eventually.eql('abc1234')
    })
    it('should resolve "unknown" if no versionFile present', () => {
      fs.readFile.rejects('no file found')
      return expect(versionFile.commit()).to.eventually.eql('unknown')
    })
    it('should resolve "unknown" if no commit present in version file', () => {
      fs.readFile.resolves('foo: bar')
      return expect(versionFile.commit()).to.eventually.eql('unknown')
    })
  })

  describe('date', () => {
    it('should resolve the built date', () => {
      fs.readFile.resolves('date: Jan 1 1970')
      return expect(versionFile.date()).to.eventually.eql('Jan 1 1970')
    })
    it('should resolve "unknown" if no versionFile present', () => {
      fs.readFile.rejects('no file found')
      return expect(versionFile.date()).to.eventually.eql('unknown')
    })
    it('should resolve "unknown" if no commit present in version file', () => {
      fs.readFile.resolves('foo: bar')
      return expect(versionFile.date()).to.eventually.eql('unknown')
    })
  })
})
