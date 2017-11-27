const fs = require('fs-extra');
const yaml = require('js-yaml');

const defaultObj = {
  version: 'unknown',
  commit: 'unknown',
  date: 'unknown'
};

const versionFile = () => {
  const versionFilePath = `${process.env.NODE_PATH || '.'}/version`;

  return fs.readFile(versionFilePath)
    .then(yaml.safeLoad)
    .catch((err) => defaultObj);
}

const version = () => {
  return versionFile().then(props => {
    return (props.version) ? (props.build) ?  props.version + "-" + props.build : props.version : defaultObj.version
  });
};

const commit = () => {
  return versionFile().then(props => props.commit || defaultObj.commit);
};

const date = () => {
  return versionFile().then(props => props.date || defaultObj.date);
}

module.exports = { version, commit, date };
