const fs = require('fs').promises
const yaml = require('js-yaml')

let defaultObj

const versionFile = () => {
  const versionFilePath = `${process.env.NODE_PATH || '.'}/version`

  defaultObj = {
    version: process.env.PACKAGES_VERSION || 'unknown',
    commit: 'unknown',
    date: 'unknown'
  }

  return fs.readFile(versionFilePath)
    .then(yaml.load)
    .catch((err) => defaultObj)
}

const version = () => {
  return versionFile().then(props => {
    return (props.version) ? (props.number) ? props.version + '-' + props.number : props.version : defaultObj.version
  })
}

const commit = () => {
  return versionFile().then(props => props.commit || defaultObj.commit)
}

const date = () => {
  return versionFile().then(props => props.date || defaultObj.date)
}

module.exports = { version, commit, date }
