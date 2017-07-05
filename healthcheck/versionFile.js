const fs = require('fs-extra');
const yaml = require('js-yaml');

const defaultObj = {
  commit: 'unknown'
};

const versionFile = () => {
  const versionFilePath = `${process.env.NODE_PATH || '.'}/version`;

  return fs.readFile(versionFilePath)
    .then(yaml.safeLoad)
    .catch((err) => defaultObj);
}

const commit = () => {
  return versionFile().then(props => props.commit || defaultObj.commit);
};

module.exports = { commit };
