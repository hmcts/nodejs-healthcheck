'use strict'

const { expect } = require('../chai-sinon')
const outputs = require('../../healthcheck/outputs')

describe('Status output', () => {
  it('should output up', () => {
    expect(outputs.up()).to.eql({ status: 'UP' })
  })

  it('should output down', () => {
    expect(outputs.down()).to.eql({ status: 'DOWN' })
  })

  it('should output up with extra properties', () => {
    expect(outputs.up({ extra: 'value' })).to.eql({ status: 'UP', extra: 'value' })
  })

  it('should output down with extra properties', () => {
    expect(outputs.down({ extra: 'value' })).to.eql({ status: 'DOWN', extra: 'value' })
  })

  it('should not allow status to be overwritten', () => {
    expect(outputs.up({ status: 'DOWN' })).to.eql({ status: 'UP' })
  })
})
