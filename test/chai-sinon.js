const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const expect = chai.expect
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
chai.should()
chai.use(sinonChai)
chai.use(chaiAsPromised)

module.exports = {
  expect,
  sinon
}
