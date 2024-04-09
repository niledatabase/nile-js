/* eslint-disable @typescript-eslint/no-var-requires */
const svgr = require('@svgr/rollup');

module.exports = {
  rollup(config) {
    config.plugins.push(svgr());
    return config;
  },
};
