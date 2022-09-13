// eslint-disable-next-line @typescript-eslint/no-var-requires
var path = require('path');

module.exports = {
  stories: ['../stories/**/*.stories.@(ts|tsx|js|jsx)'],
  addons: ['@storybook/addon-links', '@storybook/addon-essentials'],
  // https://storybook.js.org/docs/react/configure/typescript#mainjs-configuration
  typescript: {
    check: true, // type-check stories during Storybook build
  },
  webpackFinal: async (config) => {
    // Remove the existing css rule
    config.module.rules = config.module.rules.filter(
      (f) => f.test.toString() !== '/\\.css$/'
    );

    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: 'javascript/auto',
    });

    config.resolve.modules = [
      ...(config.resolve.modules || []),
      path.resolve(__dirname, '../'),
    ];

    config.resolve.alias = {
      ...config.resolve.alias,
      '~/lib': path.resolve(__dirname, '../lib'),
    };
    config.module.rules.push({
      test: /\.css$/,
      use: [
        'style-loader',
        {
          loader: 'css-loader',
          options: {
            modules: true, // Enable modules to help you using className
          },
        },
      ],
      include: path.resolve(__dirname, '../stories'),
    });

    return config;
  },
};
