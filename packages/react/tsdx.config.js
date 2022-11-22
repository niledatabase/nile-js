// eslint-disable-next-line @typescript-eslint/no-var-requires
// eslint-disable-next-line @typescript-eslint/no-var-requires
const svgr = require('@svgr/rollup');

module.exports = {
  rollup(config) {
    config.plugins = [svgr(), ...config.plugins];

    return config;
  },
};
