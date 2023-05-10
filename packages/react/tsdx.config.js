/* eslint-disable @typescript-eslint/no-var-requires */
const svgr = require('@svgr/rollup');
const babel = require('@rollup/plugin-babel');
const terser = require('rollup-plugin-terser');

module.exports = {
  rollup(config) {
    const basePlugins = config.plugins
      .filter(Boolean)
      .filter((config) => config.name !== 'babel')
      .filter((config) => config.name !== 'terser');
    config.plugins = [...basePlugins, babel(), svgr(), terser.terser()];
    return config;
  },
};
